$files = Get-ChildItem -Path ".\app\invoicemaker\client\components\ui\*.js" -Recurse
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $newContent = $content -replace 'from "@/lib/utils"', 'from "../../lib/utils"'
    $newContent | Set-Content $file.FullName -NoNewline
}