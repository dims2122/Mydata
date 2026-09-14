// ========================================
// INSIGHT JS
// ========================================


// ========================================
// SUPABASE
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

const totalRevenue =
    document.getElementById("totalRevenue");

const totalCustomers =
    document.getElementById("totalCustomers");

const totalProjects =
    document.getElementById("totalProjects");

const averageProject =
    document.getElementById("averageProject");

const customerStatus =
    document.getElementById("customerStatus");

const projectStatus =
    document.getElementById("projectStatus");

const packageInsight =
    document.getElementById("packageInsight");

const paymentInsight =
    document.getElementById("paymentInsight");

const monthlyRevenue =
    document.getElementById("monthlyRevenue");

const topProjects =
    document.getElementById("topProjects");

const logoutButton =
    document.getElementById("logoutButton");


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
// LOGIN CHECK
// ========================================

async function checkLogin() {

    const {
        data,
        error
    } =
        await supabaseClient.auth.getUser();

    if (
        error ||
        !data.user
    ) {

        window.location.href =
            "login.html";

        return null;
    }

    return data.user;
}


// ========================================
// CUSTOMER STATUS
// ========================================

async function loadCustomerStatus(userId) {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("customers")
            .select("status")
            .eq("user_id", userId);

    if (error) {

        console.error(
            "Customer status:",
            error
        );

        customerStatus.innerHTML =
            `<div class="empty">
                Gagal memuat data.
            </div>`;

        return;
    }


    const statuses = [
        "prospect",
        "negotiation",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled"
    ];


    const labels = {
        prospect: "Prospect",
        negotiation: "Negosiasi",
        confirmed: "Confirmed",
        in_progress: "Dalam Project",
        completed: "Selesai",
        cancelled: "Cancelled"
    };


    const counts = {};

    statuses.forEach(
        status => counts[status] = 0
    );


    data.forEach(customer => {

        if (
            counts[customer.status]
            !== undefined
        ) {

            counts[customer.status]++;
        }

    });


    const total = data.length || 1;


    customerStatus.innerHTML =
        statuses.map(status => {

            const count =
                counts[status];

            const percentage =
                Math.round(
                    (count / total) * 100
                );

            return `

                <div class="status-row">

                    <div class="status-info">

                        <span class="status-dot"></span>

                        <span class="status-name">
                            ${labels[status]}
                        </span>

                    </div>

                    <div class="progress">

                        <div
                            class="progress-bar"
                            style="width:${percentage}%"
                        ></div>

                    </div>

                    <span class="status-count">
                        ${count}
                    </span>

                </div>

            `;

        }).join("");

}


// ========================================
// PROJECT STATUS
// ========================================

async function loadProjectStatus(userId) {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("projects")
            .select("status")
            .eq("user_id", userId);


    if (error) {

        console.error(
            "Project status:",
            error
        );

        projectStatus.innerHTML =
            `<div class="empty">
                Gagal memuat data.
            </div>`;

        return;
    }


    const statuses = [
        "pending",
        "in_progress",
        "revision",
        "completed",
        "cancelled"
    ];


    const labels = {
        pending: "Pending",
        in_progress: "Dalam Pengerjaan",
        revision: "Revisi",
        completed: "Selesai",
        cancelled: "Cancelled"
    };


    const counts = {};

    statuses.forEach(
        status => counts[status] = 0
    );


    data.forEach(project => {

        if (
            counts[project.status]
            !== undefined
        ) {

            counts[project.status]++;
        }

    });


    const total =
        data.length || 1;


    projectStatus.innerHTML =
        statuses.map(status => {

            const count =
                counts[status];

            const percentage =
                Math.round(
                    (count / total) * 100
                );

            return `

                <div class="status-row">

                    <div class="status-info">

                        <span class="status-dot"></span>

                        <span class="status-name">
                            ${labels[status]}
                        </span>

                    </div>

                    <div class="progress">

                        <div
                            class="progress-bar"
                            style="width:${percentage}%"
                        ></div>

                    </div>

                    <span class="status-count">
                        ${count}
                    </span>

                </div>

            `;

        }).join("");

}


// ========================================
// PACKAGE INSIGHT
// ========================================

async function loadPackageInsight(userId) {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("projects")
            .select(`
                package_name_snapshot
            `)
            .eq("user_id", userId);


    if (error) {

        console.error(
            "Package insight:",
            error
        );

        packageInsight.innerHTML =
            `<div class="empty">
                Gagal memuat data.
            </div>`;

        return;
    }


    const packages = {};


    data.forEach(project => {

        const name =
            project.package_name_snapshot
            || "Tanpa Paket";

        packages[name] =
            (packages[name] || 0) + 1;

    });


    const sorted =
        Object.entries(packages)
            .sort(
                (a, b) => b[1] - a[1]
            );


    if (!sorted.length) {

        packageInsight.innerHTML =
            `<div class="empty">
                Belum ada data paket.
            </div>`;

        return;
    }


    packageInsight.innerHTML =
        sorted
            .slice(0, 5)
            .map(
                ([name, count], index) => `

                    <div class="package-row">

                        <div class="package-rank">
                            ${index + 1}
                        </div>

                        <div class="package-info">

                            <div class="package-name">
                                ${name}
                            </div>

                            <div class="package-count">
                                ${count} project
                            </div>

                        </div>

                    </div>

                `
            )
            .join("");

}


// ========================================
// PAYMENT INSIGHT
// ========================================

async function loadPaymentInsight(userId) {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("customers")
            .select("payment_method")
            .eq("user_id", userId);


    if (error) {

        console.error(
            "Payment insight:",
            error
        );

        paymentInsight.innerHTML =
            `<div class="empty">
                Gagal memuat data.
            </div>`;

        return;
    }


    const methods = {};


    const labels = {
        cash: "Cash",
        transfer: "Transfer",
        qris: "QRIS",
        debit: "Debit",
        credit: "Credit",
        other: "Lainnya"
    };


    data.forEach(customer => {

        const method =
            customer.payment_method
            || "other";

        methods[method] =
            (methods[method] || 0) + 1;

    });


    const sorted =
        Object.entries(methods)
            .sort(
                (a, b) => b[1] - a[1]
            );


    if (!sorted.length) {

        paymentInsight.innerHTML =
            `<div class="empty">
                Belum ada data pembayaran.
            </div>`;

        return;
    }

   
    paymentInsight.innerHTML =
        sorted.map(
            ([method, count]) => `

                <div class="payment-row">

                    <span class="payment-name">
                        ${labels[method] || method}
                    </span>

                    <span class="payment-count">
                        ${count} pelanggan
                    </span>

                </div>

            `
        ).join("");

}


// ========================================
// MONTHLY REVENUE
// ========================================

async function loadMonthlyRevenue(userId) {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("payments")
            .select(
                "amount,payment_date"
            )
            .eq("user_id", userId);


    if (error) {

        console.error(
            "Monthly revenue:",
            error
        );

        monthlyRevenue.innerHTML =
            `<div class="empty">
                Gagal memuat data.
            </div>`;

        return;
    }


    const months = [];

    const now = new Date();


    for (
        let i = 5;
        i >= 0;
        i--
    ) {

        const date =
            new Date(
                now.getFullYear(),
                now.getMonth() - i,
                1
            );

        months.push({
            year:
                date.getFullYear(),

            month:
                date.getMonth(),

            label:
                date.toLocaleDateString(
                    "id-ID",
                    {
                        month: "short"
                    }
                ),

            amount: 0
        });

    }


    data.forEach(payment => {

        if (!payment.payment_date)
            return;


        const date =
            new Date(
                payment.payment_date
            );


        const month =
            months.find(item =>
                item.year ===
                    date.getFullYear()
                &&
                item.month ===
                    date.getMonth()
            );


        if (month) {

            month.amount +=
                Number(
                    payment.amount
                ) || 0;

        }

    });


    monthlyRevenue.innerHTML =
        months.map(month => `

            <div class="month-row">

                <span class="month-name">
                    ${month.label}
                    ${month.year}
                </span>

                <div class="month-value">
                    ${formatRupiah(
                        month.amount
                    )}
                </div>

            </div>

        `).join("");

}


// ========================================
// TOP PROJECTS
// ========================================

async function loadTopProjects(userId) {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("projects")
            .select(`
                project_name,
                package_name_snapshot,
                package_price_snapshot,
                status,
                customers (
                    name
                )
            `)
            .eq("user_id", userId);


    if (error) {

        console.error(
            "Top projects:",
            error
        );

        topProjects.innerHTML =
            `
            <tr>
                <td colspan="5">
                    Gagal memuat data.
                </td>
            </tr>
            `;

        return;
    }


    const sorted =
        [...data]
            .sort(
                (a, b) =>
                    Number(
                        b.package_price_snapshot
                    || 0)
                    -
                    Number(
                        a.package_price_snapshot
                    || 0
                    )
            )
            .slice(0, 10);


    if (!sorted.length) {

        topProjects.innerHTML =
            `
            <tr>
                <td colspan="5" class="empty">
                    Belum ada project.
                </td>
            </tr>
            `;

        return;
    }


    const statusLabels = {
        pending: "Pending",
        in_progress: "Dalam Pengerjaan",
        revision: "Revisi",
        completed: "Selesai",
        cancelled: "Cancelled"
    };


    topProjects.innerHTML =
        sorted.map(project => `

            <tr>

                <td>
                    <div class="project-name">
                        ${project.project_name}
                    </div>
                </td>

                <td>
                    <div class="project-customer">
                        ${project.customers?.name || "-"}
                    </div>
                </td>

                <td>
                    ${project.package_name_snapshot || "-"}
                </td>

                <td>
                    <div class="project-price">
                        ${formatRupiah(
                            project.package_price_snapshot
                        )}
                    </div>
                </td>

                <td>

                    <span class="status-badge">
                        ${
                            statusLabels[
                                project.status
                            ]
                            || project.status
                        }
                    </span>

                </td>

            </tr>

        `).join("");

}


// ========================================
// MAIN STATISTICS
// ========================================

async function loadStatistics(userId) {

    const [
        customersResult,
        projectsResult,
        paymentsResult
    ] =
        await Promise.all([

            supabaseClient
                .from("customers")
                .select("id")
                .eq("user_id", userId),

            supabaseClient
                .from("projects")
                .select(
                    "package_price_snapshot"
                )
                .eq("user_id", userId),

            supabaseClient
                .from("payments")
                .select("amount")
                .eq("user_id", userId)

        ]);


    const customers =
        customersResult.data || [];

    const projects =
        projectsResult.data || [];

    const payments =
        paymentsResult.data || [];


    const revenue =
        payments.reduce(
            (total, payment) =>
                total +
                (Number(payment.amount) || 0),
            0
        );


    const projectValue =
        projects.reduce(
            (total, project) =>
                total +
                (
                    Number(
                        project.package_price_snapshot
                    ) || 0
                ),
            0
        );


    totalCustomers.textContent =
        customers.length;


    totalProjects.textContent =
        projects.length;


    totalRevenue.textContent =
        formatRupiah(revenue);


    const average =
        projects.length
            ? projectValue / projects.length
            : 0;


    averageProject.textContent =
        formatRupiah(average);

}


// ========================================
// LOGOUT
// ========================================

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function () {

            const {
                error
            } =
                await supabaseClient
                    .auth
                    .signOut();


            if (error) {

                console.error(
                    "Logout gagal:",
                    error
                );

                return;
            }


            window.location.href =
                "login.html";

        }
    );

}


// ========================================
// INITIALIZE
// ========================================

async function initInsight() {

    const user =
        await checkLogin();


    if (!user)
        return;


    await Promise.all([

        loadStatistics(
            user.id
        ),

        loadCustomerStatus(
            user.id
        ),

        loadProjectStatus(
            user.id
        ),

        loadPackageInsight(
            user.id
        ),

        loadPaymentInsight(
            user.id
        ),

        loadMonthlyRevenue(
            user.id
        ),

        loadTopProjects(
            user.id
        )

    ]);

}


initInsight();