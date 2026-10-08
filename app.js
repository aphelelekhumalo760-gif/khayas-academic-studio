import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

/* =========================================================
   KHAYA'S ACADEMIC STUDIO
   SUPABASE CONFIGURATION
   ========================================================= */

const SUPABASE_URL =
    "https://iqzcoagodfbixjyukpbb.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_jEMWxNFfSdZ5MxyXW_9_yg_5qRmt0Q3";

const BUCKET =
    "academic-resources";


/* =========================================================
   SUPABASE CLIENT
   ========================================================= */

const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    }
);


/* =========================================================
   HELPERS
   ========================================================= */

function byId(id) {
    return document.getElementById(id);
}


function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   ADMINISTRATOR MODAL
   ========================================================= */

const manager =
    byId("manager");

const openManager =
    byId("openManager");


function openAdmin() {

    console.log(
        "Khaya's Academic Studio: Administrator opened."
    );

    if (!manager) {
        console.error(
            "Administrator modal #manager was not found."
        );

        return;
    }

    manager.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow =
        "hidden";
}


function closeAdmin() {

    if (!manager) {
        return;
    }

    manager.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.style.overflow =
        "";
}


/* =========================================================
   ADMIN BUTTON
   ========================================================= */

if (openManager) {

    openManager.addEventListener(
        "click",
        function(event) {

            event.preventDefault();
            event.stopPropagation();

            openAdmin();

        }
    );

} else {

    console.error(
        "ADMINISTRATOR button #openManager was not found."
    );

}


/* =========================================================
   CLOSE BUTTONS
   ========================================================= */

if (manager) {

    manager
        .querySelectorAll("[data-close]")
        .forEach(function(element) {

            element.addEventListener(
                "click",
                closeAdmin
            );

        });

}


/* =========================================================
   ESCAPE KEY
   ========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape" &&
            manager &&
            manager.getAttribute("aria-hidden") === "false"
        ) {

            closeAdmin();

        }

    }
);


/* =========================================================
   AUTH UI
   ========================================================= */

function showLogin() {

    const loginPanel =
        byId("loginPanel");

    const adminPanel =
        byId("adminPanel");

    if (loginPanel) {
        loginPanel.hidden = false;
    }

    if (adminPanel) {
        adminPanel.hidden = true;
    }

}


function showAdmin() {

    const loginPanel =
        byId("loginPanel");

    const adminPanel =
        byId("adminPanel");

    if (loginPanel) {
        loginPanel.hidden = true;
    }

    if (adminPanel) {
        adminPanel.hidden = false;
    }

}


/* =========================================================
   CHECK CURRENT SESSION
   ========================================================= */

async function checkSession() {

    const {
        data,
        error
    } = await supabase.auth.getSession();

    if (error) {

        console.error(
            "Session error:",
            error
        );

        showLogin();

        return null;
    }

    const session =
        data?.session || null;

    if (session) {

        showAdmin();

        const emailDisplay =
            byId("adminEmailDisplay");

        if (emailDisplay) {
            emailDisplay.textContent =
                session.user.email || "";
        }

        const authStatus =
            byId("authStatus");

        if (authStatus) {

            authStatus.textContent =
                "Administrator session active.";

        }

        await loadManagerResources();

        return session;

    }

    showLogin();

    return null;
}


/* =========================================================
   LOGIN
   ========================================================= */

const loginForm =
    byId("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            const email =
                byId("adminEmail")?.value.trim();

            const password =
                byId("adminPassword")?.value;

            const message =
                byId("loginMessage");

            if (message) {
                message.textContent =
                    "Signing in...";
            }

            const {
                data,
                error
            } =
                await supabase.auth.signInWithPassword({
                    email,
                    password
                });


            if (error) {

                console.error(
                    "Login error:",
                    error
                );

                if (message) {

                    message.textContent =
                        error.message;

                }

                return;
            }


            if (message) {
                message.textContent = "";
            }


            const authStatus =
                byId("authStatus");

            if (authStatus) {

                authStatus.textContent =
                    "Administrator session active.";

            }


            if (data?.user) {

                const emailDisplay =
                    byId("adminEmailDisplay");

                if (emailDisplay) {

                    emailDisplay.textContent =
                        data.user.email || "";

                }

            }


            showAdmin();

            await loadManagerResources();

        }
    );

}


/* =========================================================
   LOGOUT
   ========================================================= */

const logoutBtn =
    byId("logoutBtn");


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async function() {

            await supabase.auth.signOut();

            showLogin();

            const authStatus =
                byId("authStatus");

            if (authStatus) {

                authStatus.textContent =
                    "Administrator access required.";

            }

            const email =
                byId("adminEmail");

            const password =
                byId("adminPassword");

            if (email) {
                email.value = "";
            }

            if (password) {
                password.value = "";
            }

        }
    );

}


/* =========================================================
   AUTH STATE CHANGES
   ========================================================= */

supabase.auth.onAuthStateChange(
    async function(event, session) {

        console.log(
            "Auth event:",
            event
        );

        if (session) {

            showAdmin();

            const emailDisplay =
                byId("adminEmailDisplay");

            if (emailDisplay) {

                emailDisplay.textContent =
                    session.user.email || "";

            }

            await loadManagerResources();

        } else {

            showLogin();

        }

    }
);


/* =========================================================
   PUBLIC RESOURCE LOADING
   ========================================================= */

async function loadPublicResources() {

    const grid =
        byId("resourceGrid");

    const empty =
        byId("resourceEmpty");

    if (!grid) {
        return;
    }


    grid.innerHTML =
        "<p>Loading resources...</p>";


    const {
        data,
        error
    } =
        await supabase
            .from("guides")
            .select("*")
            .eq("published", true)
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Public resource error:",
            error
        );

        grid.innerHTML = "";

        if (empty) {
            empty.hidden = false;
        }

        return;
    }


    renderPublicResources(
        data || []
    );

}


/* =========================================================
   PUBLIC RESOURCE RENDERING
   ========================================================= */

function renderPublicResources(resources) {

    const grid =
        byId("resourceGrid");

    const empty =
        byId("resourceEmpty");

    if (!grid) {
        return;
    }


    const grade =
        byId("gradeFilter")?.value || "all";

    const subject =
        byId("subjectFilter")?.value || "all";


    const filtered =
        resources.filter(function(resource) {

            const gradeMatch =
                grade === "all" ||
                resource.grade === grade;

            const subjectMatch =
                subject === "all" ||
                resource.subject === subject;

            return (
                gradeMatch &&
                subjectMatch
            );

        });


    if (!filtered.length) {

        grid.innerHTML = "";

        if (empty) {
            empty.hidden = false;
        }

        return;
    }


    if (empty) {
        empty.hidden = true;
    }


    grid.innerHTML =
        filtered
            .map(function(resource) {

                return `
                    <article class="resource-card">

                        <div>

                            <div class="resource-card-meta">

                                <span class="resource-card-grade">
                                    ${escapeHTML(resource.grade)}
                                </span>

                                <span class="resource-card-subject">
                                    ${escapeHTML(resource.subject)}
                                </span>

                            </div>

                            <h3>
                                ${escapeHTML(resource.title)}
                            </h3>

                            ${
                                resource.topic
                                ?
                                `<p><strong>${escapeHTML(resource.topic)}</strong></p>`
                                :
                                ""
                            }

                            <p>
                                ${escapeHTML(
                                    resource.description ||
                                    "Academic resource from Khaya's Academic Studio."
                                )}
                            </p>

                        </div>

                        <button
                            type="button"
                            class="resource-view"
                            data-resource-id="${escapeHTML(resource.id)}"
                        >
                            VIEW RESOURCE
                        </button>

                    </article>
                `;

            })
            .join("");


    grid
        .querySelectorAll(
            "[data-resource-id]"
        )
        .forEach(function(button) {

            button.addEventListener(
                "click",
                function() {

                    openResource(
                        button.dataset.resourceId,
                        resources
                    );

                }
            );

        });

}


/* =========================================================
   PUBLIC RESOURCE OPENING
   ========================================================= */

async function openResource(
    resourceId,
    resources
) {

    const resource =
        resources.find(
            function(item) {
                return item.id === resourceId;
            }
        );

    if (!resource) {
        return;
    }

    if (!resource.file_path) {
        alert(
            "This resource does not have a PDF attached yet."
        );
        return;
    }

    /*
     * PUBLIC RESOURCE FIX
     *
     * Public guides are served directly from the Supabase
     * Storage bucket. This avoids signed-URL failures for
     * normal website visitors.
     *
     * IMPORTANT:
     * The "academic-resources" bucket must be set to PUBLIC
     * in Supabase Storage.
     */

    const {
        data
    } =
        supabase
            .storage
            .from(BUCKET)
            .getPublicUrl(
                resource.file_path
            );

    const publicUrl =
        data?.publicUrl;

    if (!publicUrl) {

        console.error(
            "Could not create public PDF URL.",
            resource
        );

        alert(
            "The resource could not be opened. Please try again later."
        );

        return;
    }

    window.open(
        publicUrl,
        "_blank",
        "noopener"
    );
}


/* =========================================================
   FILTER EVENTS
   ========================================================= */

const gradeFilter =
    byId("gradeFilter");

const subjectFilter =
    byId("subjectFilter");


let publicResourcesCache = [];


if (gradeFilter) {

    gradeFilter.addEventListener(
        "change",
        function() {

            renderPublicResources(
                publicResourcesCache
            );

        }
    );

}


if (subjectFilter) {

    subjectFilter.addEventListener(
        "change",
        function() {

            renderPublicResources(
                publicResourcesCache
            );

        }
    );

}


/* =========================================================
   RELOAD PUBLIC RESOURCES WITH CACHE
   ========================================================= */

async function refreshPublicResources() {

    const {
        data,
        error
    } =
        await supabase
            .from("guides")
            .select("*")
            .eq("published", true)
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Resource loading error:",
            error
        );

        publicResourcesCache = [];

        renderPublicResources([]);

        return;
    }


    publicResourcesCache =
        data || [];

    renderPublicResources(
        publicResourcesCache
    );

}


/* =========================================================
   ADMIN RESOURCE MANAGER
   ========================================================= */

async function loadManagerResources() {

    const list =
        byId("managerList");

    if (!list) {
        return;
    }


    list.innerHTML =
        "<p>Loading resources...</p>";


    const {
        data,
        error
    } =
        await supabase
            .from("guides")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Manager resource error:",
            error
        );

        list.innerHTML = `
            <p>
                Could not load resources.
            </p>
        `;

        return;
    }


    if (!data?.length) {

        list.innerHTML = `
            <p>
                No academic resources have been uploaded yet.
            </p>
        `;

        return;
    }


    list.innerHTML =
        data
            .map(function(resource) {

                const statusClass =
                    resource.published
                    ? "public"
                    : "private";

                const statusText =
                    resource.published
                    ? "PUBLIC"
                    : "PRIVATE";


                return `
                    <div class="manager-item">

                        <div>

                            <h3>
                                ${escapeHTML(resource.title)}
                            </h3>

                            <small>
                                ${escapeHTML(resource.grade)}
                                —
                                ${escapeHTML(resource.subject)}
                            </small>

                            <span
                                class="manager-badge ${statusClass}"
                            >
                                ${statusText}
                            </span>

                        </div>


                        <div class="manager-actions">

                            ${
                                resource.published

                                ?

                                `
                                <button
                                    type="button"
                                    data-action="private"
                                    data-id="${escapeHTML(resource.id)}"
                                >
                                    MAKE PRIVATE
                                </button>
                                `

                                :

                                `
                                <button
                                    type="button"
                                    data-action="public"
                                    data-id="${escapeHTML(resource.id)}"
                                >
                                    PUBLISH
                                </button>
                                `
                            }


                            <button
                                type="button"
                                data-action="edit"
                                data-id="${escapeHTML(resource.id)}"
                            >
                                EDIT
                            </button>


                            <button
                                type="button"
                                data-action="delete"
                                data-id="${escapeHTML(resource.id)}"
                            >
                                DELETE
                            </button>

                        </div>

                    </div>
                `;

            })
            .join("");


    list
        .querySelectorAll(
            "[data-action]"
        )
        .forEach(function(button) {

            button.addEventListener(
                "click",
                async function() {

                    const action =
                        button.dataset.action;

                    const id =
                        button.dataset.id;


                    if (action === "public") {

                        await setPublished(
                            id,
                            true
                        );

                    }


                    if (action === "private") {

                        await setPublished(
                            id,
                            false
                        );

                    }


                    if (action === "edit") {

                        await editResource(
                            id
                        );

                    }


                    if (action === "delete") {

                        await deleteResource(
                            id
                        );

                    }

                }
            );

        });

}


/* =========================================================
   PUBLISH / PRIVATE
   ========================================================= */

async function setPublished(
    id,
    published
) {

    const {
        error
    } =
        await supabase
            .from("guides")
            .update({
                published,
                updated_at:
                    new Date().toISOString()
            })
            .eq("id", id);


    if (error) {

        console.error(
            "Publish update error:",
            error
        );

        alert(
            error.message
        );

        return;
    }


    await loadManagerResources();
    await refreshPublicResources();

}


/* =========================================================
   EDIT RESOURCE
   ========================================================= */

async function editResource(id) {

    const {
        data,
        error
    } =
        await supabase
            .from("guides")
            .select("*")
            .eq("id", id)
            .single();


    if (error || !data) {

        alert(
            "Could not load this resource."
        );

        return;
    }


    const title =
        prompt(
            "Guide title:",
            data.title || ""
        );


    if (title === null) {
        return;
    }


    const description =
        prompt(
            "Short description:",
            data.description || ""
        );


    if (description === null) {
        return;
    }


    const topic =
        prompt(
            "Topic:",
            data.topic || ""
        );


    if (topic === null) {
        return;
    }


    const {
        error: updateError
    } =
        await supabase
            .from("guides")
            .update({

                title:
                    title.trim(),

                description:
                    description.trim() ||
                    null,

                topic:
                    topic.trim() ||
                    null,

                updated_at:
                    new Date().toISOString()

            })
            .eq(
                "id",
                id
            );


    if (updateError) {

        alert(
            updateError.message
        );

        return;
    }


    await loadManagerResources();
    await refreshPublicResources();

}


/* =========================================================
   DELETE RESOURCE
   ========================================================= */

async function deleteResource(id) {

    const confirmed =
        confirm(
            "Delete this academic resource permanently?"
        );


    if (!confirmed) {
        return;
    }


    const {
        data,
        error
    } =
        await supabase
            .from("guides")
            .select("file_path")
            .eq("id", id)
            .single();


    if (error) {

        alert(
            error.message
        );

        return;
    }


    if (data?.file_path) {

        const {
            error: storageError
        } =
            await supabase
                .storage
                .from(BUCKET)
                .remove([
                    data.file_path
                ]);


        if (storageError) {

            console.warn(
                "Storage deletion warning:",
                storageError
            );

        }

    }


    const {
        error: deleteError
    } =
        await supabase
            .from("guides")
            .delete()
            .eq(
                "id",
                id
            );


    if (deleteError) {

        alert(
            deleteError.message
        );

        return;
    }


    await loadManagerResources();
    await refreshPublicResources();

}


/* =========================================================
   UPLOAD RESOURCE
   ========================================================= */

const resourceForm =
    byId("resourceForm");


if (resourceForm) {

    resourceForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const title =
                byId("rTitle")?.value.trim();

            const grade =
                byId("rGrade")?.value;

            const subject =
                byId("rSubject")?.value;

            const topic =
                byId("rTopic")?.value.trim();

            const description =
                byId("rDesc")?.value.trim();

            const file =
                byId("rFile")?.files?.[0];

            const published =
                byId("rPublished")?.value === "true";


            if (!title) {

                alert(
                    "Please enter a guide title."
                );

                return;
            }


            if (!file) {

                alert(
                    "Please select a PDF file."
                );

                return;
            }


            if (
                file.type !==
                "application/pdf"
            ) {

                alert(
                    "Only PDF files are allowed."
                );

                return;
            }


            const {
                data: sessionData
            } =
                await supabase.auth.getSession();


            const session =
                sessionData?.session;


            if (!session) {

                alert(
                    "Your administrator session has expired. Please sign in again."
                );

                showLogin();

                return;
            }


            const submitButton =
                resourceForm.querySelector(
                    "button[type='submit']"
                );


            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.textContent =
                    "UPLOADING...";

            }


            try {

                const safeName =
                    file.name
                        .replace(
                            /[^a-zA-Z0-9._-]/g,
                            "-"
                        );


                const filePath =
                    `${Date.now()}-${safeName}`;


                console.log(
                    "Uploading:",
                    filePath
                );


                const {
                    error: uploadError
                } =
                    await supabase
                        .storage
                        .from(BUCKET)
                        .upload(
                            filePath,
                            file,
                            {
                                cacheControl:
                                    "3600",

                                upsert:
                                    false,

                                contentType:
                                    "application/pdf"
                            }
                        );


                if (uploadError) {

                    throw uploadError;

                }


                console.log(
                    "Storage upload successful."
                );


                const {
                    data: inserted,
                    error: insertError
                } =
                    await supabase
                        .from("guides")
                        .insert({

                            title,

                            grade,

                            subject,

                            category:
                                "Topic Guide",

                            topic:
                                topic ||
                                null,

                            description:
                                description ||
                                null,

                            file_path:
                                filePath,

                            file_url:
                                null,

                            published,

                            updated_at:
                                new Date().toISOString()

                        })
                        .select()
                        .single();


                if (insertError) {

                    await supabase
                        .storage
                        .from(BUCKET)
                        .remove([
                            filePath
                        ]);

                    throw insertError;

                }


                console.log(
                    "Database record created:",
                    inserted
                );


                alert(
                    published
                    ?
                    "Resource uploaded and published."
                    :
                    "Resource uploaded and kept private."
                );


                resourceForm.reset();

                await loadManagerResources();
                await refreshPublicResources();


            } catch (error) {

                console.error(
                    "Upload error:",
                    error
                );

                alert(
                    "Upload failed:\n\n" +
                    (
                        error?.message ||
                        "Unknown error"
                    )
                );

            } finally {

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "UPLOAD RESOURCE";

                }

            }

        }
    );

}


/* =========================================================
   INITIALISE
   ========================================================= */

async function initialise() {

    console.log(
        "Khaya's Academic Studio initialising..."
    );


    /*
     * Load public resources.
     */

    await refreshPublicResources();


    /*
     * Check administrator session.
     */

    await checkSession();


    console.log(
        "Khaya's Academic Studio ready."
    );

}


initialise();