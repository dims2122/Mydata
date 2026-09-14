// ========================================
// PROJECTS JS
// ========================================

const SUPABASE_URL =
    "https://yevvekkwhovevqcvyhxv.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_Vx9PlEUAX3NyVVEVMSzmDQ_XwtUYZKW";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


// ========================================
// ELEMENT
// ========================================

const projectTableBody =
    document.getElementById(
        "projectTableBody"
    );

const addProjectButton =
    document.getElementById(
        "addProjectButton"
    );

const projectModal =
    document.getElementById(
        "projectModal"
    );

const closeModal =
    document.getElementById(
        "closeModal"
    );

const cancelButton =
    document.getElementById(
        "cancelButton"
    );

const projectForm =
    document.getElementById(
        "projectForm"
    );

const modalTitle =
    document.getElementById(
        "modalTitle"
    );

const projectIdInput =
    document.getElementById(
        "projectId"
    );

const customerIdInput =
    document.getElementById(
        "customerId"
    );

const projectNameInput =
    document.getElementById(
        "projectName"
    );

const packageIdInput =
    document.getElementById(
        "packageId"
    );

const statusInput =
    document.getElementById(
        "status"
    );

const startDateInput =
    document.getElementById(
        "startDate"
    );

const deadlineInput =
    document.getElementById(
        "deadline"
    );

const notesInput =
    document.getElementById(
        "notes"
    );

const packageInfo =
    document.getElementById(
        "packageInfo"
    );

const formError =
    document.getElementById(
        "formError"
    );

const saveButton =
    document.getElementById(
        "saveButton"
    );

const searchInput =
    document.getElementById(
        "searchInput"
    );

const statusFilter =
    document.getElementById(
        "statusFilter"
    );

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


// ========================================
// STATE
// ========================================

let currentUser = null;

let projects = [];

let customers = [];

let packages = [];


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
// STATUS LABEL
// ========================================

function formatStatus(status) {

    const labels = {

        pending: "Pending",

        in_progress: "Dalam Proses",

        revision: "Revisi",

        completed: "Selesai",

        cancelled: "Dibatalkan"

    };

    return labels[status] || status;

}


// ========================================
// CHECK LOGIN
// ========================================

async function checkLogin() {

    const {
        data: { user }
    } = await supabaseClient
        .auth
        .getUser();


    if (!user) {

        window.location.href =
            "login.html";

        return null;

    }


    currentUser = user;

    return user;

}


// ========================================
// LOAD CUSTOMERS
// ========================================

async function loadCustomers() {

    const {
        data,
        error
    } = await supabaseClient
        .from("customers")
        .select(
            "id, name, business_name, status"
        )
        .eq(
            "user_id",
            currentUser.id
        )
        .order(
            "name",
            {
                ascending: true
            }
        );


    if (error) {

        console.error(
            "Gagal memuat pelanggan:",
            error
        );

        return;

    }


    customers = data || [];


    customerIdInput.innerHTML = `
        <option value="">
            Pilih pelanggan
        </option>
    `;


    customers.forEach(
        customer => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                customer.id;

            option.textContent =
                customer.business_name
                    ? `${customer.name} — ${customer.business_name}`
                    : customer.name;

            customerIdInput.appendChild(
                option
            );

        }
    );

}


// ========================================
// LOAD PACKAGES
// ========================================

async function loadPackages() {

    const {
        data,
        error
    } = await supabaseClient
        .from("packages")
        .select(
            "id, name, price, active"
        )
        .eq(
            "user_id",
            currentUser.id
        )
        .order(
            "name",
            {
                ascending: true
            }
        );


    if (error) {

        console.error(
            "Gagal memuat paket:",
            error
        );

        return;

    }


    packages = data || [];


    renderPackageOptions();

}


// ========================================
// PACKAGE OPTIONS
// ========================================

function renderPackageOptions(
    selectedId = ""
) {

    packageIdInput.innerHTML = `
        <option value="">
            Tanpa paket
        </option>
    `;


    packages
        .filter(pkg => pkg.active)
        .forEach(pkg => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                pkg.id;

            option.textContent =
                `${pkg.name} — ${formatRupiah(pkg.price)}`;

            packageIdInput.appendChild(
                option
            );

        });


    if (selectedId) {

        packageIdInput.value =
            selectedId;

    }

}


// ========================================
// PACKAGE INFO
// ========================================

packageIdInput.addEventListener(
    "change",
    updatePackageInfo
);


function updatePackageInfo() {

    const selectedPackage =
        packages.find(
            pkg =>
                pkg.id ===
                packageIdInput.value
        );


    if (!selectedPackage) {

        packageInfo.innerHTML =
            "Pilih paket untuk melihat harga.";

        return;

    }


    packageInfo.innerHTML = `
        Paket:
        <strong>
            ${selectedPackage.name}
        </strong>

        &nbsp; • &nbsp;

        Harga:
        <strong>
            ${formatRupiah(
                selectedPackage.price
            )}
        </strong>
    `;

}


// ========================================
// LOAD PROJECTS
// ========================================

async function loadProjects() {

    projectTableBody.innerHTML = `
        <tr>
            <td
                colspan="7"
                class="loading"
            >
                Memuat data...
            </td>
        </tr>
    `;


    const {
        data,
        error
    } = await supabaseClient
        .from("projects")
        .select(`
            *,
            customers (
                id,
                name,
                business_name
            ),
            packages (
                id,
                name,
                price
            )
        `)
        .eq(
            "user_id",
            currentUser.id
        )
        .order(
            "created_at",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(
            "Gagal memuat project:",
            error
        );


        projectTableBody.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="loading"
                >
                    Gagal memuat data project.
                </td>
            </tr>
        `;

        return;

    }


    projects = data || [];

    renderProjects();

}


// ========================================
// RENDER PROJECTS
// ========================================

function renderProjects() {

    const search =
        searchInput.value
            .toLowerCase()
            .trim();

    const selectedStatus =
        statusFilter.value;


    const filtered =
        projects.filter(
            project => {

                const customerName =
                    project.customers?.name ||
                    "";

                const businessName =
                    project.customers
                        ?.business_name ||
                    "";

                const projectName =
                    project.project_name ||
                    "";


                const searchText =
                    `${projectName}
                    ${customerName}
                    ${businessName}`
                        .toLowerCase();


                const matchesSearch =
                    !search ||
                    searchText.includes(
                        search
                    );


                const matchesStatus =
                    selectedStatus ===
                        "all" ||
                    project.status ===
                        selectedStatus;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    projectTableBody.innerHTML = "";


    if (filtered.length === 0) {

        projectTableBody.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="loading"
                >
                    Tidak ada project.
                </td>
            </tr>
        `;

        return;

    }


    filtered.forEach(
        project => {

            const row =
                document.createElement(
                    "tr"
                );


            const customer =
                project.customers;


            const packageData =
                project.packages;


            const deadlineInfo =
                getDeadlineInfo(
                    project.deadline
                );


            row.innerHTML = `

                <td>

                    <div class="project-name">
                        ${project.project_name || "-"}
                    </div>

                    <div class="project-date">
                        ${
                            project.start_date
                                ? `Mulai ${formatDate(
                                    project.start_date
                                )}`
                                : "Belum dimulai"
                        }
                    </div>

                </td>


                <td>

                    <div class="customer-name">
                        ${customer?.name || "-"}
                    </div>

                    <div class="customer-business">
                        ${
                            customer?.business_name ||
                            ""
                        }
                    </div>

                </td>


                <td>

                    ${
                        packageData
                            ? `
                                <div class="package-name">
                                    ${packageData.name}
                                </div>
                            `
                            : "-"
                    }

                </td>


                <td>

                    <span class="price">

                        ${
                            project.package_price_snapshot
                                ? formatRupiah(
                                    project.package_price_snapshot
                                )
                                : "-"
                        }

                    </span>

                </td>


                <td>

                    <div class="
                        deadline
                        ${deadlineInfo.className}
                    ">
                        ${deadlineInfo.text}
                    </div>

                </td>


                <td>

                    <span class="status-badge">
                        ${formatStatus(
                            project.status
                        )}
                    </span>

                </td>


                <td>

                    <div class="actions">

                        <button
                            class="action-button"
                            title="Edit"
                            onclick="editProject('${project.id}')"
                        >
                            ✏️
                        </button>


                        <button
                            class="action-button delete"
                            title="Hapus"
                            onclick="deleteProject('${project.id}')"
                        >
                            🗑️
                        </button>

                    </div>

                </td>

            `;


            projectTableBody.appendChild(
                row
            );

        }
    );

}


// ========================================
// DATE
// ========================================

function formatDate(date) {

    if (!date) return "-";


    return new Intl.DateTimeFormat(
        "id-ID",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    ).format(
        new Date(
            `${date}T00:00:00`
        )
    );

}


// ========================================
// DEADLINE INFO
// ========================================

function getDeadlineInfo(date) {

    if (!date) {

        return {
            text: "Belum ditentukan",
            className: ""
        };

    }


    const deadline =
        new Date(
            `${date}T00:00:00`
        );


    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    const diff =
        Math.ceil(
            (
                deadline -
                today
            ) /
            (
                1000 *
                60 *
                60 *
                24
            )
        );


    if (diff < 0) {

        return {
            text:
                `Lewat ${Math.abs(diff)} hari`,
            className:
                "danger"
        };

    }


    if (diff === 0) {

        return {
            text: "Hari ini",
            className: "danger"
        };

    }


    if (diff <= 7) {

        return {
            text:
                `${diff} hari lagi`,
            className:
                "warning"
        };

    }


    return {

        text:
            formatDate(date),

        className:
            ""

    };

}


// ========================================
// OPEN MODAL
// ========================================

function openModal() {

    projectModal.classList.add(
        "active"
    );

}


// ========================================
// CLOSE MODAL
// ========================================

function closeProjectModal() {

    projectModal.classList.remove(
        "active"
    );

    projectForm.reset();

    projectIdInput.value = "";

    modalTitle.textContent =
        "Tambah Project";

    saveButton.textContent =
        "Simpan Project";

    packageInfo.textContent =
        "Pilih paket untuk melihat harga.";

    formError.textContent = "";

}


// ========================================
// ADD PROJECT
// ========================================

addProjectButton.addEventListener(
    "click",
    () => {

        closeProjectModal();

        renderPackageOptions();

        openModal();

    }
);


// ========================================
// CLOSE MODAL
// ========================================

closeModal.addEventListener(
    "click",
    closeProjectModal
);

cancelButton.addEventListener(
    "click",
    closeProjectModal
);


// ========================================
// EDIT PROJECT
// ========================================

window.editProject =
    function(id) {

        const project =
            projects.find(
                item =>
                    item.id === id
            );


        if (!project) return;


        projectIdInput.value =
            project.id;


        customerIdInput.value =
            project.customer_id ||
            "";


        projectNameInput.value =
            project.project_name ||
            "";


        renderPackageOptions(
            project.package_id || ""
        );


        statusInput.value =
            project.status ||
            "pending";


        startDateInput.value =
            project.start_date ||
            "";


        deadlineInput.value =
            project.deadline ||
            "";


        notesInput.value =
            project.notes ||
            "";


        modalTitle.textContent =
            "Edit Project";

        saveButton.textContent =
            "Simpan Perubahan";


        updatePackageInfo();


        openModal();

    };


// ========================================
// SAVE PROJECT
// ========================================

projectForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        formError.textContent = "";


        const selectedPackage =
            packages.find(
                pkg =>
                    pkg.id ===
                    packageIdInput.value
            );


        const data = {

            user_id:
                currentUser.id,

            customer_id:
                customerIdInput.value,

            package_id:
                packageIdInput.value ||
                null,

            project_name:
                projectNameInput.value
                    .trim(),

            package_name_snapshot:
                selectedPackage
                    ? selectedPackage.name
                    : null,

            package_price_snapshot:
                selectedPackage
                    ? selectedPackage.price
                    : 0,

            status:
                statusInput.value,

            start_date:
                startDateInput.value ||
                null,

            deadline:
                deadlineInput.value ||
                null,

            notes:
                notesInput.value
                    .trim() ||
                null

        };


        if (!data.customer_id) {

            formError.textContent =
                "Pelanggan wajib dipilih.";

            return;

        }


        if (!data.project_name) {

            formError.textContent =
                "Nama project wajib diisi.";

            return;

        }


        saveButton.disabled =
            true;

        saveButton.textContent =
            "Menyimpan...";


        let result;


        if (projectIdInput.value) {

            result =
                await supabaseClient
                    .from("projects")
                    .update(data)
                    .eq(
                        "id",
                        projectIdInput.value
                    )
                    .eq(
                        "user_id",
                        currentUser.id
                    );

        } else {

            result =
                await supabaseClient
                    .from("projects")
                    .insert(data);

        }


        if (result.error) {

            console.error(
                "Project error:",
                result.error
            );


            formError.textContent =
                result.error.message;


            saveButton.disabled =
                false;


            saveButton.textContent =
                projectIdInput.value
                    ? "Simpan Perubahan"
                    : "Simpan Project";

            return;

        }


        closeProjectModal();

        await loadProjects();


        saveButton.disabled =
            false;

    }
);


// ========================================
// DELETE PROJECT
// ========================================

window.deleteProject =
    async function(id) {

        const project =
            projects.find(
                item =>
                    item.id === id
            );


        if (!project) return;


        const confirmed =
            confirm(
                `Hapus project "${project.project_name}"?`
            );


        if (!confirmed) return;


        const {
            error
        } = await supabaseClient
            .from("projects")
            .delete()
            .eq(
                "id",
                id
            )
            .eq(
                "user_id",
                currentUser.id
            );


        if (error) {

            console.error(
                "Delete error:",
                error
            );


            alert(
                "Gagal menghapus project."
            );


            return;

        }


        await loadProjects();

    };


// ========================================
// SEARCH
// ========================================

searchInput.addEventListener(
    "input",
    renderProjects
);

statusFilter.addEventListener(
    "change",
    renderProjects
);


// ========================================
// LOGOUT
// ========================================

logoutButton.addEventListener(
    "click",
    async () => {

        await supabaseClient
            .auth
            .signOut();

        window.location.href =
            "login.html";

    }
);
 
 
// ========================================
// INIT
// ========================================

async function init() {

    const user =
        await checkLogin();


    if (!user) return;


    await Promise.all([
        loadCustomers(),
        loadPackages()
    ]);


    await loadProjects();

}


init(); 