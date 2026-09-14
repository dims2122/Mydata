// ========================================
// DASHBOARD JS
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

const totalCustomers =
    document.getElementById("totalCustomers");

const totalProspects =
    document.getElementById("totalProspects");

const activeProjects =
    document.getElementById("activeProjects");

const totalRevenue =
    document.getElementById("totalRevenue");

const recentProjects =
    document.getElementById("recentProjects");

const recentCustomers =
    document.getElementById("recentCustomers");

const expirationList =
    document.getElementById("expirationList");

const logoutButton =
    document.getElementById("logoutButton");

const addCustomerButton =
    document.getElementById("addCustomerButton");


// ========================================
// RUPIAH
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
// CHECK LOGIN
// ========================================

async function checkLogin() {

    const {
        data,
        error
    } = await supabaseClient.auth.getSession();


    if (error) {

        console.error(
            "Gagal mengecek session:",
            error
        );

        window.location.href = "login.html";

        return null;
    }


    if (!data.session) {

        window.location.href = "login.html";

        return null;
    }


    return data.session;

}


// ========================================
// LOAD STATISTICS
// ========================================

async function loadStatistics() {

    // TOTAL CUSTOMER

    const {
        count: customerCount,
        error: customerError
    } = await supabaseClient
        .from("customers")
        .select("*", {
            count: "exact",
            head: true
        });


    if (customerError) {

        console.error(
            "Customer error:",
            customerError
        );

    } else {

        totalCustomers.textContent =
            customerCount || 0;

    }


    // PROSPECT

    const {
        count: prospectCount,
        error: prospectError
    } = await supabaseClient
        .from("customers")
        .select("*", {
            count: "exact",
            head: true
        })
        .eq("status", "prospect");


    if (prospectError) {

        console.error(
            "Prospect error:",
            prospectError
        );

    } else {

        totalProspects.textContent =
            prospectCount || 0;

    }


    // PROJECT BERJALAN

    const {
        count: projectCount,
        error: projectError
    } = await supabaseClient
        .from("projects")
        .select("*", {
            count: "exact",
            head: true
        })
        .in(
            "status",
            [
                "pending",
                "in_progress",
                "revision"
            ]
        );


    if (projectError) {

        console.error(
            "Project error:",
            projectError
        );

    } else {

        activeProjects.textContent =
            projectCount || 0;

    }


    // TOTAL PENDAPATAN

    const {
        data: payments,
        error: paymentError
    } = await supabaseClient
        .from("payments")
        .select("amount");


    if (paymentError) {

        console.error(
            "Payment error:",
            paymentError
        );

        return;
    }


    const revenue =
        (payments || []).reduce(
            (total, payment) => {

                return total +
                    Number(payment.amount || 0);

            },
            0
        );


    totalRevenue.textContent =
        formatRupiah(revenue);

}


// ========================================
// LOAD RECENT CUSTOMERS
// ========================================

async function loadRecentCustomers() {

    const {
        data,
        error
    } = await supabaseClient
        .from("customers")
        .select(`
            id,
            name,
            business_name,
            status,
            created_at
        `)
        .order(
            "created_at",
            {
                ascending: false
            }
        )
        .limit(5);


    if (error) {

        console.error(
            "Gagal mengambil pelanggan:",
            error
        );

        recentCustomers.innerHTML = `
            <div class="empty-state">
                Gagal memuat pelanggan.
            </div>
        `;

        return;
    }


    if (!data || data.length === 0) {

        recentCustomers.innerHTML = `
            <div class="empty-state">
                Belum ada pelanggan.
            </div>
        `;

        return;
    }


    recentCustomers.innerHTML =
        data.map(customer => {

            return `
                <div class="list-item">

                    <div class="list-info">

                        <div class="list-name">
                            ${escapeHTML(customer.name)}
                        </div>

                        <div class="list-subtitle">
                            ${escapeHTML(
                                customer.business_name ||
                                "Tidak ada nama bisnis"
                            )}
                        </div>

                    </div>

                    ${getStatusBadge(
                        customer.status
                    )}

                </div>
            `;

        }).join("");

}


// ========================================
// LOAD RECENT PROJECTS
// ========================================

async function loadRecentProjects() {

    const {
        data,
        error
    } = await supabaseClient
        .from("projects")
        .select(`
            id,
            project_name,
            status,
            created_at,
            customers (
                name
            )
        `)
        .order(
            "created_at",
            {
                ascending: false
            }
        )
        .limit(5);


    if (error) {

        console.error(
            "Gagal mengambil project:",
            error
        );

        recentProjects.innerHTML = `
            <div class="empty-state">
                Gagal memuat project.
            </div>
        `;

        return;
    }


    if (!data || data.length === 0) {

        recentProjects.innerHTML = `
            <div class="empty-state">
                Belum ada project.
            </div>
        `;

        return;
    }


    recentProjects.innerHTML =
        data.map(project => {

            const customerName =
                project.customers?.name ||
                "Tanpa pelanggan";


            return `
                <div class="list-item">

                    <div class="list-info">

                        <div class="list-name">
                            ${escapeHTML(
                                project.project_name
                            )}
                        </div>

                        <div class="list-subtitle">
                            ${escapeHTML(
                                customerName
                            )}
                        </div>

                    </div>

                    ${getStatusBadge(
                        project.status
                    )}

                </div>
            `;

        }).join("");

}


// ========================================
// LOAD HOSTING + DOMAIN EXPIRATION
// ========================================

async function loadExpirationData() {

    /*
        Kita ambil data hosting dan domain
        secara terpisah karena keduanya
        berada di tabel berbeda.
    */


    // HOSTING

    const {
        data: hostingData,
        error: hostingError
    } = await supabaseClient
        .from("hosting")
        .select(`
            id,
            project_id,
            expiry_date,
            status,
            projects (
                project_name,
                customers (
                    name
                )
            )
        `)
        .order(
            "expiry_date",
            {
                ascending: true
            }
        );


    if (hostingError) {

        console.error(
            "Hosting error:",
            hostingError
        );

    }


    // DOMAIN

    const {
        data: domainData,
        error: domainError
    } = await supabaseClient
        .from("domains")
        .select(`
            id,
            project_id,
            domain_name,
            expiry_date,
            status,
            projects (
                project_name,
                customers (
                    name
                )
            )
        `)
        .order(
            "expiry_date",
            {
                ascending: true
            }
        );


    if (domainError) {

        console.error(
            "Domain error:",
            domainError
        );

    }


    const hosting =
        hostingData || [];

    const domains =
        domainData || [];


    if (
        hosting.length === 0 &&
        domains.length === 0
    ) {

        expirationList.innerHTML = `
            <div class="empty-state">
                Belum ada data hosting atau domain.
            </div>
        `;

        return;
    }


    /*
        Gabungkan berdasarkan project_id.
    */

    const projectsMap =
        new Map();


    hosting.forEach(item => {

        if (!item.project_id) return;


        if (!projectsMap.has(item.project_id)) {

            projectsMap.set(
                item.project_id,
                {
                    projectName:
                        item.projects?.project_name ||
                        "Project",

                    customerName:
                        item.projects?.customers?.name ||
                        "Pelanggan",

                    hosting: null,

                    domain: null
                }
            );

        }


        projectsMap.get(
            item.project_id
        ).hosting = item;

    });


    domains.forEach(item => {

        if (!item.project_id) return;


        if (!projectsMap.has(item.project_id)) {

            projectsMap.set(
                item.project_id,
                {
                    projectName:
                        item.projects?.project_name ||
                        "Project",

                    customerName:
                        item.projects?.customers?.name ||
                        "Pelanggan",

                    hosting: null,

                    domain: null
                }
            );

        }


        projectsMap.get(
            item.project_id
        ).domain = item;

    });


    const projects =
        Array.from(
            projectsMap.values()
        );


    /*
        Urutkan berdasarkan tanggal
        expired terdekat.
    */

    projects.sort(
        (a, b) => {

            const dateA =
                getClosestExpiry(a);

            const dateB =
                getClosestExpiry(b);


            return dateA - dateB;

        }
    );


    expirationList.innerHTML =
        projects
            .slice(0, 10)
            .map(project => {

                return `
                    <div class="expiration-item">

                        <div class="expiration-customer">

                            <div>

                                <div class="expiration-customer-name">
                                    ${escapeHTML(
                                        project.customerName
                                    )}
                                </div>

                                <div class="expiration-project">
                                    ${escapeHTML(
                                        project.projectName
                                    )}
                                </div>

                            </div>

                        </div>


                        <div class="expiration-services">

                            ${renderService(
                                "Hosting",
                                project.hosting
                            )}

                            ${renderDomain(
                                project.domain
                            )}

                        </div>

                    </div>
                `;

            })
            .join("");

}


// ========================================
// RENDER HOSTING
// ========================================

function renderService(
    serviceName,
    data
) {

    if (!data) {

        return `
            <div class="expiration-service">

                <div class="service-header">

                    <span class="service-name">
                        ${serviceName}
                    </span>

                </div>

                <div class="service-date">
                    Belum ada data
                </div>

            </div>
        `;

    }


    const days =
        calculateDaysLeft(
            data.expiry_date
        );


    const status =
        getExpirationStatus(days);


    return `
        <div class="expiration-service">

            <div class="service-header">

                <span class="service-name">
                    ${serviceName}
                </span>

                <span class="service-status ${status.className}">
                    ${status.label}
                </span>

            </div>

            <div class="service-date">

                Expired:
                ${formatDate(
                    data.expiry_date
                )}

            </div>

            <div class="service-days ${status.className}">

                ${getDaysText(days)}

            </div>

        </div>
    `;

}


// ========================================
// RENDER DOMAIN
// ========================================

function renderDomain(data) {

    if (!data) {

        return `
            <div class="expiration-service">

                <div class="service-header">

                    <span class="service-name">
                        Domain
                    </span>

                </div>

                <div class="service-date">
                    Belum ada data
                </div>

            </div>
        `;

    }


    const days =
        calculateDaysLeft(
            data.expiry_date
        );


    const status =
        getExpirationStatus(days);


    return `
        <div class="expiration-service">

            <div class="service-header">

                <span class="service-name">
                    Domain
                </span>

                <span class="service-status ${status.className}">
                    ${status.label}
                </span>

            </div>

            <div class="service-date">

                ${escapeHTML(
                    data.domain_name || ""
                )}

            </div>

            <div class="service-date">

                Expired:
                ${formatDate(
                    data.expiry_date
                )}

            </div>

            <div class="service-days ${status.className}">

                ${getDaysText(days)}

            </div>

        </div>
    `;

}


// ========================================
// CALCULATE DAYS
// ========================================

function calculateDaysLeft(
    expiryDate
) {

    if (!expiryDate) {

        return null;

    }


    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    const expiry =
        new Date(
            expiryDate
        );


    expiry.setHours(
        0,
        0,
        0,
        0
    );


    const difference =
        expiry.getTime() -
        today.getTime();


    return Math.ceil(
        difference /
        (1000 * 60 * 60 * 24)
    );

}


// ========================================
// EXPIRATION STATUS
// ========================================

function getExpirationStatus(
    days
) {

    if (days === null) {

        return {
            label: "Tidak ada tanggal",
            className: "days-warning"
        };

    }


    if (days < 0) {

        return {
            label: "Expired",
            className: "days-expired"
        };

    }


    if (days <= 7) {

        return {
            label: "Segera",
            className: "days-danger"
        };

    }


    if (days <= 30) {

        return {
            label: "Perhatian",
            className: "days-warning"
        };

    }


    return {
        label: "Aktif",
        className: "days-safe"
    };

}


// ========================================
// DAYS TEXT
// ========================================

function getDaysText(days) {

    if (days === null) {

        return "Tanggal belum tersedia";

    }


    if (days < 0) {

        return `
            Sudah expired
            ${Math.abs(days)} hari lalu
        `;

    }


    if (days === 0) {

        return "Expired hari ini";

    }


    if (days === 1) {

        return "1 hari lagi";

    }


    return `${days} hari lagi`;

}


// ========================================
// CLOSEST EXPIRY
// ========================================

function getClosestExpiry(
    project
) {

    const dates = [];


    if (
        project.hosting &&
        project.hosting.expiry_date
    ) {

        dates.push(
            new Date(
                project.hosting.expiry_date
            ).getTime()
        );

    }


    if (
        project.domain &&
        project.domain.expiry_date
    ) {

        dates.push(
            new Date(
                project.domain.expiry_date
            ).getTime()
        );

    }


    if (dates.length === 0) {

        return Infinity;

    }


    return Math.min(...dates);

}


// ========================================
// FORMAT DATE
// ========================================

function formatDate(
    date
) {

    if (!date) {

        return "-";

    }


    return new Intl.DateTimeFormat(
        "id-ID",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    ).format(
        new Date(date)
    );

}


// ========================================
// STATUS BADGE
// ========================================

function getStatusBadge(
    status
) {

    const statusMap = {

        prospect: {
            text: "Prospect",
            className: "status-prospect"
        },

        negotiation: {
            text: "Negosiasi",
            className: "status-pending"
        },

        confirmed: {
            text: "Confirmed",
            className: "status-progress"
        },

        in_progress: {
            text: "Berjalan",
            className: "status-progress"
        },

        pending: {
            text: "Pending",
            className: "status-pending"
        },

        revision: {
            text: "Revisi",
            className: "status-pending"
        },

        completed: {
            text: "Selesai",
            className: "status-completed"
        },

        cancelled: {
            text: "Dibatalkan",
            className: "status-cancelled"
        }

    };


    const result =
        statusMap[status] || {

            text: status || "Unknown",

            className: "status-prospect"

        };


    return `
        <span class="status-badge ${result.className}">
            ${result.text}
        </span>
    `;

}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(
    value
) {

    if (value === null ||
        value === undefined) {

        return "";

    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ========================================
// LOGOUT
// ========================================

// ========================================
// LOGOUT
// ========================================

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function () {

            logoutButton.disabled = true;
            logoutButton.textContent = "Logout...";

            const { error } =
                await supabaseClient.auth.signOut({
                    scope: "global"
                });

            if (error) {

                console.error(
                    "Logout gagal:",
                    error
                );

                alert(
                    "Logout gagal: " +
                    error.message
                );

                logoutButton.disabled = false;
                logoutButton.innerHTML =
                    "<span>🚪</span><span>Logout</span>";

                return;
            }

            // Pastikan session benar-benar hilang
            const {
                data
            } = await supabaseClient.auth.getSession();

            if (data.session) {

                console.error(
                    "Session masih aktif."
                );

                return;
            }

            // Kembali ke login
            window.location.replace(
                "login.html"
            );

        }
    );

}


// ========================================
// TAMBAH PELANGGAN
// ========================================

if (addCustomerButton) {

    addCustomerButton.addEventListener(
        "click",
        function () {

            window.location.href =
                "customers.html";

        }
    );

}


// ========================================
// LOAD DASHBOARD
// ========================================

async function loadDashboard() {

    const session =
        await checkLogin();


    if (!session) {

        return;

    }


    await Promise.all([

        loadStatistics(),

        loadRecentCustomers(),

        loadRecentProjects(),

        loadExpirationData()

    ]);

}


// ========================================
// START
// ========================================

loadDashboard();