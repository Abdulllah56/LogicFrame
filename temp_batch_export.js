
exportBatchBtn?.addEventListener("click", async () => {
    if (state.queue.length === 0) return;
    const originalImage = state.image;
    const originalActive = state.activeIndex;

    setLoading(true, "Generating batch export...");

    // Allow UI to update
    setTimeout(async () => {
        try {
            const zip = new JSZip();
            const folder = zip.folder("screenshots");

            for (let i = 0; i < state.queue.length; i++) {
                if (loadingText) loadingText.textContent = `Processing image ${i + 1}/${state.queue.length}...`;

                const item = state.queue[i];
                state.image = item.imgElement;
                state.activeIndex = i;

                // Force render
                render();

                // Wait a tick for render? Render is sync here but maybe safe to wait?
                // `render` is synchronous canvas drawing.

                const scale = state.exportOptions.scale;
                const targetW = state.width * scale;
                const targetH = state.height * scale;
                const format = state.exportOptions.format;
                const quality = state.exportOptions.quality;
                const ext = format.split('/')[1];

                let blob;
                if (scale === 1) {
                    blob = await new Promise(r => canvas.toBlob(r, format, quality));
                } else {
                    const offCanvas = document.createElement("canvas");
                    offCanvas.width = targetW;
                    offCanvas.height = targetH;
                    const offCtx = offCanvas.getContext("2d");
                    offCtx.imageSmoothingEnabled = true;
                    offCtx.imageSmoothingQuality = "high";
                    offCtx.drawImage(canvas, 0, 0, targetW, targetH);
                    blob = await new Promise(r => offCanvas.toBlob(r, format, quality));
                }

                folder.file(`beautified_${item.name.replace(/\.[^/.]+$/, "")}@${scale}x.${ext}`, blob);

                // Small delay to keep UI responsive if queue is huge?
                await new Promise(r => setTimeout(r, 10));
            }

            if (loadingText) loadingText.textContent = "Compressing zip...";
            const content = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(content);
            const a = document.createElement("a");
            a.href = url; a.download = `screenshots_batch_${Date.now()}.zip`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);

            // Restore original state
            state.image = originalImage;
            state.activeIndex = originalActive;
            render();

            showMessage("Batch export downloaded!");
        } catch (e) {
            console.error(e);
            showMessage("Batch export failed");
        } finally {
            setLoading(false);
        }
    }, 50);
});
