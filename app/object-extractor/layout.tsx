export const metadata = {
  title: 'Object Extractor - AI Image Processing',
  description: 'Extract and isolate objects from images using advanced AI detection and editing tools.',
};

export default function ObjectExtractorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="object-extractor-app h-full w-full">
      {children}
    </div>
  );
}
