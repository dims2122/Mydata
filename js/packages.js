// ========================================
// PACKAGES JS
// ========================================


// ========================================
// SUPABASE
// ========================================

const SUPABASE_URL =
    "https://yevvekkwhovevqcvyhxv.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_Vx9PlEUAX3NyVVEVMSzmDQ_XwtUYZKW";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


// ========================================
// ELEMENT
// ========================================

const packageList =
    document.getElementById("packageList");

const openPackageModal =
    document.getElementById("openPackageModal");

const closePackageModal =
    document.getElementById("closePackageModal");

const cancelPackage =
    document.getElementById("cancelPackage");

const packageModal =
    document.getElementById("packageModal");

const packageForm =
    document.getElementById("packageForm");

const packageId =
    document.getElementById("packageId");

const packageName =
    document.getElementById("packageName");

const packageDescription =
    document.getElementById("packageDescription");

const packagePrice =
    document.getElementById("packagePrice");

const revisionLimit =
    document.getElementById("revisionLimit");

const unlimitedRevision =
    document.getElementById("unlimitedRevision");

const hostingIncluded =
    document.getElementById("hostingIncluded");

const domainIncluded =
    document.getElementById("domainIncluded");

const maintenanceIncluded =
    document.getElementById("maintenanceIncluded");

const packageError =
    document.getElementById("packageError");

const modalTitle =
    document.getElementById("modalTitle");

const savePackage =
    document.getElementById("savePackage");

const searchPackage =
    document.getElementById("searchPackage");

const filterStatus =
    document.getElementById("filterStatus");

const logoutButton =
    document.getElementById("logoutButton");


// ========================================
// DATA
// ========================================

let currentUser = null;
let packages = [];


// ========================================
// CHECK LOGIN
// ========================================

async function checkLogin() {

    const {
        data,
        error
    } = await supabaseClient.auth.getUser();

    if (error || !data.user) {

        window.location.href = "login.html";

        return false;
    }

    currentUser = data.user;

    return true;
}


// ========================================
// LOAD PACKAGES
// ========================================

async function loadPackages() {

    packageList.innerHTML = `
        <div class="loading">
            Memuat paket...
        </div>
    `;

    const {
        data,
        error
    } = await supabaseClient
        .from("packages")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", {
            ascending: false
        });

    if (error) {

        console.error(error);

        packageList.innerHTML = `
            <div class="empty">
                Gagal memuat paket.
            </div>
        `;

        return;
    }

    packages = data || [];

    renderPackages();
}


// ========================================
// RENDER
// ========================================

function renderPackages() {

    const search =
        searchPackage.value
            .trim()
            .toLowerCase();

    const status =
        filterStatus.value;


    const filtered =
        packages.filter(pkg => {

            const matchesSearch =
                pkg.name
                    .toLowerCase()
                    .includes(search) ||
                (pkg.description || "")
                    .toLowerCase()
                    .includes(search);


            const matchesStatus =
                status === "all" ||
                (status === "active" && pkg.active) ||
                (status === "inactive" && !pkg.active);


            return matchesSearch && matchesStatus;

        });


    if (filtered.length === 0) {

        packageList.innerHTML = `
            <div class="empty">
                Belum ada paket.
            </div>
        `;

        return;
    }


    packageList.innerHTML =
        filtered.map(pkg => {

            const revision =
                pkg.revision_limit === null
                    ? "♾️ Unlimited revisi"
                    : `${pkg.revision_limit}x revisi`;


            return `

                <div class="package-card">

                    <div class="package-top">

                        <div class="package-name">
                            ${escapeHtml(pkg.name)}
                        </div>

                        <span class="
                            status-badge
                            ${pkg.active
                                ? "status-active"
                                : "status-inactive"}
                        ">
                            ${pkg.active
                                ? "Aktif"
                                : "Nonaktif"}
                        </span>

                    </div>


                    <div class="package-description">

                        ${escapeHtml(
                            pkg.description ||
                            "Tidak ada deskripsi."
                        )}

                    </div>


                    <div class="package-price">

                        ${formatRupiah(pkg.price)}

                    </div>


                    <div class="package-features">

                        <div class="feature yes">
                            ✓ ${revision}
                        </div>

                        <div class="
                            feature
                            ${pkg.hosting_included
                                ? "yes"
                                : "no"}
                        ">
                            ${pkg.hosting_included
                                ? "✓"
                                : "×"}
                            Hosting
                        </div>

                        <div class="
                            feature
                            ${pkg.domain_included
                                ? "yes"
                                : "no"}
                        ">
                            ${pkg.domain_included
                                ? "✓"
                                : "×"}
                            Domain
                        </div>

                        <div class="
                            feature
                            ${pkg.maintenance_included
                                ? "yes"
                                : "no"}
                        ">
                            ${pkg.maintenance_included
                                ? "✓"
                                : "×"}
                            Maintenance
                        </div>

                        <div class="
                            feature
                            ${pkg.physical_item_included
                                ? "yes"
                                : "no"}
                        ">
                            ${pkg.physical_item_included
                                ? "✓"
                                : "×"}
                            Barang fisik
                        </div>

                    </div>


                    <div class="package-actions">

                        <button
                            class="edit-button"
                            onclick="editPackage('${pkg.id}')"
                        >
                            Edit
                        </button>

                        <button
                            class="toggle-button"
                            onclick="togglePackage('${pkg.id}')"
                        >
                            ${pkg.active
                                ? "Nonaktifkan"
                                : "Aktifkan"}
                        </button>

                        <button
                            class="delete-button"
                            onclick="deletePackage('${pkg.id}')"
                        >
                            Hapus
                        </button>

                    </div>

                </div>

            `;

        }).join("");
}


// ========================================
// OPEN MODAL
// ========================================

function openModal() {

    packageForm.reset();

    packageId.value = "";

    modalTitle.textContent =
        "Tambah Paket";

    packageError.textContent = "";

    revisionLimit.disabled = false;

    packageModal.classList.add("active");
}


// ========================================
// CLOSE MODAL
// ========================================

function closeModal() {

    packageModal.classList.remove("active");
}


// ========================================
// EDIT PACKAGE
// ========================================

window.editPackage = function (id) {

    const pkg =
        packages.find(item =>
            item.id === id
        );

    if (!pkg) return;


    packageId.value =
        pkg.id;

    packageName.value =
        pkg.name || "";

    packageDescription.value =
        pkg.description || "";

    packagePrice.value =
        pkg.price || 0;

    hostingIncluded.checked =
        pkg.hosting_included;

    domainIncluded.checked =
        pkg.domain_included;

    maintenanceIncluded.checked =
        pkg.maintenance_included,

    physicalItemIncluded.checked =
        pkg.physical_item_included;


    if (pkg.revision_limit === null) {

        unlimitedRevision.checked = true;

        revisionLimit.value = "";

        revisionLimit.disabled = true;

    } else {

        unlimitedRevision.checked = false;

        revisionLimit.value =
            pkg.revision_limit;

        revisionLimit.disabled = false;
    }


    modalTitle.textContent =
        "Edit Paket";

    packageError.textContent = "";

    packageModal.classList.add("active");
};


// ========================================
// SAVE PACKAGE
// ========================================

packageForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        packageError.textContent = "";


        const name =
            packageName.value.trim();

        const description =
            packageDescription.value.trim();

        const price =
            Number(packagePrice.value);


        if (!name) {

            packageError.textContent =
                "Nama paket wajib diisi.";

            return;
        }


        if (price < 0 || Number.isNaN(price)) {

            packageError.textContent =
                "Harga paket tidak valid.";

            return;
        }


        let revision = null;


        if (!unlimitedRevision.checked) {

            revision =
                Number(revisionLimit.value);


            if (
                Number.isNaN(revision) ||
                revision < 0 ||
                !Number.isInteger(revision)
            ) {

                packageError.textContent =
                    "Batas revisi harus berupa angka 0 atau lebih.";

                return;
            }
        }


        savePackage.disabled = true;

        savePackage.textContent =
            "Menyimpan...";


        const payload = {

            user_id:
                currentUser.id,

            name:
                name,

            description:
                description || null,

            price:
                price,

            revision_limit:
                revision,

            hosting_included:
                hostingIncluded.checked,

            domain_included:
                domainIncluded.checked,

            maintenance_included:
                maintenanceIncluded.checked,

            physical_item_included:
                 physicalItemIncluded.checked
        };


        let error;


        if (packageId.value) {

            const result =
                await supabaseClient
                    .from("packages")
                    .update(payload)
                    .eq("id", packageId.value)
                    .eq("user_id", currentUser.id);

            error = result.error;

        } else {

            const result =
                await supabaseClient
                    .from("packages")
                    .insert(payload);

            error = result.error;
        }


        if (error) {

            console.error(error);

            packageError.textContent =
                error.message ||
                "Gagal menyimpan paket.";

            savePackage.disabled = false;

            savePackage.textContent =
                "Simpan Paket";

            return;
        }


        closeModal();

        await loadPackages();


        savePackage.disabled = false;

        savePackage.textContent =
            "Simpan Paket";

    }
);


// ========================================
// TOGGLE PACKAGE
// ========================================

window.togglePackage = async function (id) {

    const pkg =
        packages.find(item =>
            item.id === id
        );

    if (!pkg) return;


    const newStatus =
        !pkg.active;


    const {
        error
    } = await supabaseClient
        .from("packages")
        .update({
            active: newStatus
        })
        .eq("id", id)
        .eq("user_id", currentUser.id);


    if (error) {

        console.error(error);

        alert(
            "Gagal mengubah status paket."
        );

        return;
    }


    await loadPackages();
};


// ========================================
// DELETE PACKAGE
// ========================================

window.deletePackage = async function (id) {

    const pkg =
        packages.find(item =>
            item.id === id
        );

    if (!pkg) return;


    const confirmDelete =
        confirm(
            `Hapus paket "${pkg.name}"?`
        );


    if (!confirmDelete) return;


    const {
        error
    } = await supabaseClient
        .from("packages")
        .delete()
        .eq("id", id)
        .eq("user_id", currentUser.id);


    if (error) {

        console.error(error);

        alert(
            "Gagal menghapus paket."
        );

        return;
    }


    await loadPackages();
};


// ========================================
// UNLIMITED REVISION
// ========================================

unlimitedRevision.addEventListener(
    "change",
    function () {

        revisionLimit.disabled =
            unlimitedRevision.checked;


        if (unlimitedRevision.checked) {

            revisionLimit.value = "";
        }
    }
);


// ========================================
// SEARCH
// ========================================

searchPackage.addEventListener(
    "input",
    renderPackages
);


// ========================================
// FILTER
// ========================================

filterStatus.addEventListener(
    "change",
    renderPackages
);


// ========================================
// MODAL EVENTS
// ========================================

openPackageModal.addEventListener(
    "click",
    openModal
);

closePackageModal.addEventListener(
    "click",
    closeModal
);

cancelPackage.addEventListener(
    "click",
    closeModal
);


packageModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target === packageModal
        ) {

            closeModal();
        }
    }
);


// ========================================
// LOGOUT
// ========================================

logoutButton.addEventListener(
    "click",
    async function () {

        const {
            error
        } = await supabaseClient.auth.signOut();

        if (error) {

            console.error(error);

            return;
        }

        window.location.href =
            "login.html";
    }
);


// ========================================
// FORMAT RUPIAH
// ========================================

function formatRupiah(value) {

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }
    ).format(value || 0);
}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ========================================
// START
// ========================================

async function init() {

    const loggedIn =
        await checkLogin();

    if (!loggedIn) return;

    await loadPackages();
}

const physicalItemIncluded =
    document.getElementById("physicalItemIncluded");


init();