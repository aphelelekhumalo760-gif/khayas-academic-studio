async function openResource(resourceId, resources) {

    const resource = resources.find(function(item) {
        return String(item.id) === String(resourceId);
    });

    if (!resource) {
        alert("This resource could not be found.");
        return;
    }

    if (!resource.file_path) {
        alert("This resource does not have a PDF attached yet.");
        return;
    }

    /*
     * KHAYA'S ACADEMIC STUDIO
     * PUBLIC SUPABASE PDF URL
     *
     * Files in the academic-resources bucket are public.
     * We construct the URL directly so the website does not
     * depend on signed URLs or temporary download links.
     */

    let filePath = String(resource.file_path).trim();

    /*
     * If an older database record accidentally contains the
     * bucket name at the beginning of file_path, remove it.
     */
    if (filePath.startsWith(BUCKET + "/")) {
        filePath = filePath.substring(BUCKET.length + 1);
    }

    /*
     * If an older record contains the complete Supabase URL,
     * extract only the storage path.
     */
    if (filePath.includes("/storage/v1/object/public/")) {

        filePath =
            filePath.split("/storage/v1/object/public/")[1];

        if (filePath.startsWith(BUCKET + "/")) {
            filePath =
                filePath.substring(BUCKET.length + 1);
        }
    }

    /*
     * Encode each part of the filename/path safely.
     */
    const encodedPath =
        filePath
            .split("/")
            .map(function(part) {
                return encodeURIComponent(part);
            })
            .join("/");

    const publicUrl =
        `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${encodedPath}`;

    console.log("Opening Khaya's Academic Studio resource:");
    console.log("Original file_path:", resource.file_path);
    console.log("Final public URL:", publicUrl);

    window.open(
        publicUrl,
        "_blank",
        "noopener,noreferrer"
    );
}
