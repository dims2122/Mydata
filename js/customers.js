// ========================================
// CUSTOMERS JS
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

const customerTableBody =
    document.getElementById(
        "customerTableBody"
    );

const addCustomerButton =
    document.getElementById(
        "addCustomerButton"
    );

const customerModal =
    document.getElementById(
        "customerModal"
    );

const closeModal =
    document.getElementById(
        "closeModal"
    );

const cancelButton =
    document.getElementById(
        "cancelButton"
    );

const customerForm =
    document.getElementById(
        "customerForm"
    );

const modalTitle =
    document.getElementById(
        "modalTitle"
    );

const customerId =
    document.getElementById(
        "customerId"
    );

const nameInput =
    document.getElementById("name");

const phoneInput =
    document.getElementById("phone");

const emailInput =
    document.getElementById("email");

const businessNameInput =
    document.getElementById(
        "businessName"
    );

const websiteNameInput =
    document.getElementById(
        "websiteName"
    );

const packageIdInput =
    document.getElementById(
        "packageId"
    );

const paymentMethodInput =
    document.getElementById(
        "paymentMethod"
    );

const statusInput =
    document.getElementById("status");

const addressInput =
    document.getElementById("address");

const notesInput =
    document.getElementById("notes");

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

let customers = [];


// ========================================
// FORMAT
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


function formatStatus(status) {

    const labels = {

        prospect: "Prospect",

        negotiation: "Negosiasi",

        confirmed: "Confirmed",

        in_progress: "Dalam Proses",

        completed: "Selesai",

        cancelled: "Dibatalkan"

    };

    return labels[status] || status;

}


function formatPayment(method) {

    const labels = {

        cash: "Cash",

        transfer: "Transfer",

        qris: "QRIS",

        debit: "Debit",

        credit: "Credit",

        other: "Lainnya"

    };

    return labels[method] || "-";

}


// ========================================
// CHECK LOGIN
// ========================================

async function checkLogin() {

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();


    if (!user) {

        window.location.href =
            "login.html";

        return null;
    }


    currentUser = user;

    return user;
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
        .select("id, name, price")
        .eq(
            "user_id",
            currentUser.id
        )
        .eq("active", true)
        .order("name");


    if (error) {

        console.error(
            "Gagal memuat paket:",
            error
        );

        return;
    }


    packageIdInput.innerHTML = `
        <option value="">
            Pilih paket
        </option>
    `;


    (data || []).forEach(pkg => {

        const option =
            document.createElement(
                "option"
            );

        option.value = pkg.id;

        option.textContent =
            `${pkg.name} - ${formatRupiah(pkg.price)}`;

        packageIdInput.appendChild(
            option
        );

    });

}


// ========================================
// LOAD CUSTOMERS
// ========================================

async function loadCustomers() {

    customerTableBody.innerHTML = `
        <tr>
            <td colspan="7" class="loading">
                Memuat data...
            </td>
        </tr>
    `;


    const {
        data,
        error
    } = await supabaseClient
        .from("customers")
        .select(`
            *,
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
            "Gagal mengambil pelanggan:",
            error
        );

        customerTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="loading">
                    Gagal memuat data.
                </td>
            </tr>
        `;

        return;
    }


    customers = data || [];

    renderCustomers();

}


// ========================================
// RENDER
// ========================================

function renderCustomers() {

    const search =
        searchInput.value
            .toLowerCase()
            .trim();

    const selectedStatus =
        statusFilter.value;


    const filtered =
        customers.filter(customer => {

            const text = [

                customer.name,

                customer.phone,

                customer.email,

                customer.business_name,

                customer.website_name

            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();


            const matchesSearch =
                !search ||
                text.includes(search);


            const matchesStatus =
                selectedStatus === "all" ||
                customer.status ===
                    selectedStatus;


            return (
                matchesSearch &&
                matchesStatus
            );

        });


    customerTableBody.innerHTML = "";


    if (filtered.length === 0) {

        customerTableBody.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="loading"
                >
                    Tidak ada pelanggan.
                </td>
            </tr>
        `;

        return;
    }


    filtered.forEach(customer => {

        const row =
            document.createElement("tr");


        const packageData =
            customer.packages;


        row.innerHTML = `

            <td>

                <div class="customer-name">
                    ${customer.name || "-"}
                </div>

                <div class="customer-email">
                    ${customer.email || ""}
                </div>

            </td>


            <td>
                ${customer.business_name || "-"}
            </td>


            <td>

                <div class="contact">
                    ${customer.phone || "-"}
                </div>

            </td>


            <td>

                ${
                    packageData
                        ? `
                            <div class="package-name">
                                ${packageData.name}
                            </div>

                            <div class="package-price">
                                ${formatRupiah(packageData.price)}
                            </div>
                        `
                        : "-"
                }

            </td>


            <td>
                ${formatPayment(
                    customer.payment_method
                )}
            </td>


            <td>

                <span class="status-badge">
                    ${formatStatus(
                        customer.status
                    )}
                </span>

            </td>


            <td>

                <div class="actions">

                    <button
                        class="action-button"
                        title="Edit"
                        onclick="editCustomer('${customer.id}')"
                    >
                        ✏️
                    </button>

                    <button
                        class="action-button delete"
                        title="Hapus"
                        onclick="deleteCustomer('${customer.id}')"
                    >
                        🗑️
                    </button>

                </div>

            </td>

        `;


        customerTableBody.appendChild(row);

    });

}


// ========================================
// OPEN MODAL
// ========================================

function openModal() {

    customerModal.classList.add(
        "active"
    );

}


// ========================================
// CLOSE MODAL
// ========================================

function closeCustomerModal() {

    customerModal.classList.remove(
        "active"
    );

    customerForm.reset();

    customerId.value = "";

    modalTitle.textContent =
        "Tambah Pelanggan";

    saveButton.textContent =
        "Simpan Pelanggan";

    formError.textContent = "";

}


// ========================================
// ADD
// ========================================

addCustomerButton.addEventListener(
    "click",
    () => {

        closeCustomerModal();

        openModal();

    }
);


// ========================================
// CLOSE
// ========================================

closeModal.addEventListener(
    "click",
    closeCustomerModal
);

cancelButton.addEventListener(
    "click",
    closeCustomerModal
);


// ========================================
// EDIT
// ========================================

window.editCustomer =
    function(id) {

        const customer =
            customers.find(
                item =>
                    item.id === id
            );


        if (!customer) return;


        customerId.value =
            customer.id;

        nameInput.value =
            customer.name || "";

        phoneInput.value =
            customer.phone || "";

        emailInput.value =
            customer.email || "";

        businessNameInput.value =
            customer.business_name || "";

        websiteNameInput.value =
            customer.website_name || "";

        packageIdInput.value =
            customer.package_id || "";

        paymentMethodInput.value =
            customer.payment_method ||
            "transfer";

        statusInput.value =
            customer.status ||
            "prospect";

        addressInput.value =
            customer.address || "";

        notesInput.value =
            customer.notes || "";


        modalTitle.textContent =
            "Edit Pelanggan";

        saveButton.textContent =
            "Simpan Perubahan";


        openModal();

    };


// ========================================
// SAVE
// ========================================

customerForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        formError.textContent = "";


        const data = {

            user_id:
                currentUser.id,

            name:
                nameInput.value.trim(),

            phone:
                phoneInput.value.trim() ||
                null,

            email:
                emailInput.value.trim() ||
                null,

            business_name:
                businessNameInput.value.trim() ||
                null,

            website_name:
                websiteNameInput.value.trim() ||
                null,

            package_id:
                packageIdInput.value ||
                null,

            payment_method:
                paymentMethodInput.value,

            status:
                statusInput.value,

            address:
                addressInput.value.trim() ||
                null,

            notes:
                notesInput.value.trim() ||
                null

        };


        if (!data.name) {

            formError.textContent =
                "Nama pelanggan wajib diisi.";

            return;
        }


        saveButton.disabled = true;

        saveButton.textContent =
            "Menyimpan...";


        let result;


        if (customerId.value) {

            result =
                await supabaseClient
                    .from("customers")
                    .update(data)
                    .eq(
                        "id",
                        customerId.value
                    )
                    .eq(
                        "user_id",
                        currentUser.id
                    );

        } else {

            result =
                await supabaseClient
                    .from("customers")
                    .insert(data);

        }


        if (result.error) {

            console.error(
                result.error
            );

            formError.textContent =
                result.error.message;

            saveButton.disabled =
                false;

            saveButton.textContent =
                customerId.value
                    ? "Simpan Perubahan"
                    : "Simpan Pelanggan";

            return;
        }


        closeCustomerModal();

        await loadCustomers();


        saveButton.disabled =
            false;

    }
);


// ========================================
// DELETE
// ========================================

window.deleteCustomer =
    async function(id) {

        const customer =
            customers.find(
                item =>
                    item.id === id
            );


        if (!customer) return;


        const confirmed =
            confirm(
                `Hapus pelanggan "${customer.name}"?`
            );


        if (!confirmed) return;


        const {
            error
        } = await supabaseClient
            .from("customers")
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
                error
            );

            alert(
                "Gagal menghapus pelanggan."
            );

            return;
        }


        await loadCustomers();

    };


// ========================================
// SEARCH
// ========================================

searchInput.addEventListener(
    "input",
    renderCustomers
);

statusFilter.addEventListener(
    "change",
    renderCustomers
);


// ========================================
// LOGOUT
// ========================================

logoutButton.addEventListener(
    "click",
    async () => {

        await supabaseClient.auth.signOut();

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


    await loadPackages();

    await loadCustomers();

}


init();   