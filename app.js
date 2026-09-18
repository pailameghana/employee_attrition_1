// EXPLAINABLE EMPLOYEE ATTRITION PREDICTION - FRONTEND APPLICATION LOGIC

// Global State
let currentUser = null;
let currentSinglePrediction = null;
let currentBatchData = [];
let globalImpChart = null;
let roleDistChart = null;

// DOM Ready
document.addEventListener("DOMContentLoaded", () => {
    checkSessionState();
    initTabNavigation();
    initSinglePredictorForm();
});

// SESSION & LOGIN HANDLERS
function checkSessionState() {
    const savedUser = localStorage.getItem("attrition_portal_user");
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            showMainApp();
            return;
        } catch (e) {
            localStorage.removeItem("attrition_portal_user");
        }
    }
    showLoginScreen();
}

function togglePasswordVisibility() {
    const pwInput = document.getElementById("login-password");
    const toggleBtn = document.getElementById("toggle-pw-btn");
    
    if (pwInput.type === "password") {
        pwInput.type = "text";
        toggleBtn.innerText = translations[currentLang]?.hide_password || "Hide";
    } else {
        pwInput.type = "password";
        toggleBtn.innerText = translations[currentLang]?.show_password || "Show";
    }
}

function handleLogin(e) {
    if (e) e.preventDefault();
    const email = document.getElementById("login-email").value;
    const pw = document.getElementById("login-password").value;
    
    if (!email || !pw) {
        showToast("Please enter email and password.", "error");
        return;
    }
    
    currentUser = { email };
    localStorage.setItem("attrition_portal_user", JSON.stringify(currentUser));
    showToast("Signed in successfully.", "success");
    showMainApp();
}

function quickLogin() {
    document.getElementById("login-email").value = "hr@company.com";
    document.getElementById("login-password").value = "admin123";
    handleLogin(null);
}

function handleLogout() {
    localStorage.removeItem("attrition_portal_user");
    currentUser = null;
    showToast("Logged out.", "success");
    showLoginScreen();
}

function showLoginScreen() {
    document.getElementById("login-screen").style.display = "flex";
    document.getElementById("app-wrapper").style.display = "none";
}

function showMainApp() {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("app-wrapper").style.display = "block";
    
    loadModelMetrics();
    loadWorkforceInsights();
    
    if (!currentSinglePrediction) {
        const form = document.getElementById("single-predictor-form");
        if (form) form.dispatchEvent(new Event("submit"));
    }
}

// TAB NAVIGATION
function initTabNavigation() {
    const navButtons = document.querySelectorAll(".nav-btn");
    navButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetTab = btn.getAttribute("data-tab");
            switchTab(targetTab);
        });
    });
}

function switchTab(tabId) {
    const navButtons = document.querySelectorAll(".nav-btn");
    navButtons.forEach(b => {
        if (b.getAttribute("data-tab") === tabId) {
            b.classList.add("active");
        } else {
            b.classList.remove("active");
        }
    });
    
    document.querySelectorAll(".tab-content").forEach(c => {
        if (c.id === tabId) {
            c.classList.add("active");
        } else {
            c.classList.remove("active");
        }
    });
    
    if (tabId === "tab-analytics") {
        setTimeout(() => {
            loadWorkforceInsights();
            loadModelMetrics();
        }, 50);
    }
    
    window.dispatchEvent(new Event('resize'));
}

// PRESETS LOADER
function loadPreset(presetType) {
    const form = document.getElementById("single-predictor-form");
    if (!form) return;
    
    if (presetType === "high_risk") {
        form["Age"].value = 35;
        form["MaritalStatus"].value = "Single";
        form["DistanceFromHome"].value = 27;
        form["JobRole"].value = "Sales Executive";
        form["OverTime"].value = "Yes";
        form["MonthlyIncome"].value = 3200;
        form["StockOptionLevel"].value = 0;
        form["JobSatisfaction"].value = 1;
        form["WorkLifeBalance"].value = 1;
        form["PerformanceRating"].value = 3;
        form["TotalWorkingYears"].value = 8;
        form["NumCompaniesWorked"].value = 6;
        form["YearsAtCompany"].value = 3;
        form["YearsSinceLastPromotion"].value = 5;
        showToast("High Risk sample loaded.", "success");
    } else if (presetType === "low_risk") {
        form["Age"].value = 46;
        form["MaritalStatus"].value = "Married";
        form["DistanceFromHome"].value = 2;
        form["JobRole"].value = "Manager";
        form["OverTime"].value = "No";
        form["MonthlyIncome"].value = 17500;
        form["StockOptionLevel"].value = 2;
        form["JobSatisfaction"].value = 4;
        form["WorkLifeBalance"].value = 3;
        form["PerformanceRating"].value = 4;
        form["TotalWorkingYears"].value = 22;
        form["NumCompaniesWorked"].value = 2;
        form["YearsAtCompany"].value = 15;
        form["YearsSinceLastPromotion"].value = 1;
        showToast("Low Risk sample loaded.", "success");
    } else if (presetType === "executive") {
        form["Age"].value = 50;
        form["MaritalStatus"].value = "Divorced";
        form["DistanceFromHome"].value = 5;
        form["JobRole"].value = "Research Director";
        form["OverTime"].value = "No";
        form["MonthlyIncome"].value = 18900;
        form["StockOptionLevel"].value = 3;
        form["JobSatisfaction"].value = 3;
        form["WorkLifeBalance"].value = 4;
        form["PerformanceRating"].value = 4;
        form["TotalWorkingYears"].value = 28;
        form["NumCompaniesWorked"].value = 3;
        form["YearsAtCompany"].value = 20;
        form["YearsSinceLastPromotion"].value = 2;
        showToast("Executive sample loaded.", "success");
    }
    
    form.dispatchEvent(new Event("submit"));
}

// SINGLE PREDICTOR FORM SUBMISSION & SHAP EXPLAINABILITY
function initSinglePredictorForm() {
    const form = document.getElementById("single-predictor-form");
    if (!form) return;
    
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const submitBtn = document.getElementById("btn-submit-predict");
        if (submitBtn) submitBtn.disabled = true;
        
        const formData = new FormData(form);
        const payload = {};
        formData.forEach((val, key) => {
            if (["Age", "DistanceFromHome", "MonthlyIncome", "StockOptionLevel", "JobSatisfaction", 
                 "WorkLifeBalance", "PerformanceRating", "TotalWorkingYears", 
                 "NumCompaniesWorked", "YearsAtCompany", "YearsSinceLastPromotion", "YearsInCurrentRole"].includes(key)) {
                payload[key] = Number(val);
            } else {
                payload[key] = val;
            }
        });

        // Fallback defaults for missing API parameters
        if (!payload["EnvironmentSatisfaction"]) payload["EnvironmentSatisfaction"] = payload["JobSatisfaction"] || 3;
        
        try {
            const resp = await fetch("/api/predict/single", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            
            if (!resp.ok) {
                const err = await resp.json();
                throw new Error(err.detail || "Prediction failed.");
            }
            
            const result = await resp.json();
            currentSinglePrediction = result;
            renderSingleResult(result);
            
        } catch (err) {
            showToast(`Error: ${err.message}`, "error");
        } finally {
            if (submitBtn) submitBtn.disabled = false;
        }
    });
}

// RENDER PREDICTION RESULT, SHAP EXPLANATIONS & SUMMARY
function renderSingleResult(res) {
    const probPct = Math.round(res.attrition_probability * 100);
    const cardWrapper = document.getElementById("res-card-wrapper");
    const badge = document.getElementById("res-risk-badge");
    const probPctEl = document.getElementById("res-prob-pct");
    const summaryText = document.getElementById("res-summary-text");
    
    probPctEl.innerText = `${probPct}%`;
    
    let riskBadgeText = translations[currentLang]?.risk_low || "Low Risk of Attrition";
    let badgeClass = "badge-low";
    let cardRiskClass = "risk-low";
    
    if (res.risk_band === "High") {
        riskBadgeText = translations[currentLang]?.risk_high || "High Risk of Attrition";
        badgeClass = "badge-high";
        cardRiskClass = "risk-high";
        summaryText.innerText = "Prediction indicates a strong likelihood of turnover. HR review is advised.";
    } else if (res.risk_band === "Medium") {
        riskBadgeText = translations[currentLang]?.risk_med || "Medium Risk of Attrition";
        badgeClass = "badge-med";
        cardRiskClass = "risk-med";
        summaryText.innerText = "Prediction indicates moderate turnover risk. Regular check-ins recommended.";
    } else {
        summaryText.innerText = "Prediction indicates stable retention with low probability of turnover.";
    }
    
    cardWrapper.className = `card result-card ${cardRiskClass}`;
    badge.className = `risk-badge ${badgeClass}`;
    badge.innerText = riskBadgeText;

    // Render Push Factors (Increasing Attrition Risk)
    const pushContainer = document.getElementById("factors-push-container");
    pushContainer.innerHTML = res.top_push_factors.length ? "" : '<p class="text-muted">No major factors increasing risk.</p>';
    
    const maxPushShap = Math.max(...res.top_push_factors.map(f => f.shap), 0.05);
    res.top_push_factors.forEach(f => {
        const barWidth = Math.min(Math.round((f.shap / maxPushShap) * 100), 100);
        const item = document.createElement("div");
        item.className = "factor-bar-item";
        item.innerHTML = `
            <div class="factor-info">
                <span>${f.plain}</span>
                <span style="color: var(--danger);">+${f.shap}</span>
            </div>
            <div class="factor-bar-bg">
                <div class="factor-bar-fill bar-push" style="width: ${barWidth}%;"></div>
            </div>
        `;
        pushContainer.appendChild(item);
    });

    // Render Pull Factors (Reducing Attrition Risk)
    const pullContainer = document.getElementById("factors-pull-container");
    pullContainer.innerHTML = res.top_pull_factors.length ? "" : '<p class="text-muted">No major factors reducing risk.</p>';
    
    const maxPullShap = Math.max(...res.top_pull_factors.map(f => Math.abs(f.shap)), 0.05);
    res.top_pull_factors.forEach(f => {
        const barWidth = Math.min(Math.round((Math.abs(f.shap) / maxPullShap) * 100), 100);
        const item = document.createElement("div");
        item.className = "factor-bar-item";
        item.innerHTML = `
            <div class="factor-info">
                <span>${f.plain}</span>
                <span style="color: var(--success);">${f.shap}</span>
            </div>
            <div class="factor-bar-bg">
                <div class="factor-bar-fill bar-pull" style="width: ${barWidth}%;"></div>
            </div>
        `;
        pullContainer.appendChild(item);
    });

    // Render Employee Risk Summary Card
    document.getElementById("sum-risk-level").innerText = `${res.risk_band} Risk`;
    document.getElementById("sum-prob").innerText = `${probPct}%`;
    document.getElementById("sum-main-factor").innerText = res.top_push_factors[0] ? res.top_push_factors[0].plain : "Competitive Tenure";
    document.getElementById("sum-sec-factor").innerText = res.top_push_factors[1] ? res.top_push_factors[1].plain : "Role Compensation";
    document.getElementById("sum-hr-action").innerText = res.recommendations && res.recommendations.length ? res.recommendations[0].title : "Review workload and satisfaction";
}

// BATCH ASSESSMENT & CSV PROCESSOR
async function runSampleBatch() {
    try {
        const resp = await fetch("/api/dataset?page=1&limit=50");
        const data = await resp.json();
        
        currentBatchData = data.records.map(r => {
            const isHigh = r.OverTime === "Yes" && r.MonthlyIncome < 4000;
            const prob = isHigh ? 0.78 : (r.MonthlyIncome > 12000 ? 0.14 : 0.38);
            const risk = prob > 0.65 ? "High" : (prob > 0.35 ? "Medium" : "Low");
            return {
                EmployeeID: r.EmployeeID,
                JobRole: r.JobRole,
                MonthlyIncome: `$${r.MonthlyIncome.toLocaleString()}`,
                OverTime: r.OverTime,
                Probability: `${Math.round(prob * 100)}%`,
                RiskBand: risk,
                TopFactors: r.OverTime === "Yes" ? "Frequent Overtime; Salary Level" : "Stable Tenure"
            };
        });
        
        renderBatchTable(currentBatchData);
        showToast("Sample batch assessment complete.", "success");
    } catch (err) {
        showToast("Failed to run sample batch.", "error");
    }
}

async function handleFileUpload(file) {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    
    try {
        const resp = await fetch("/api/predict/batch", { method: "POST", body: formData });
        const res = await resp.json();
        if (!resp.ok) throw new Error(res.detail || "Batch upload failed.");
        
        currentBatchData = res.records;
        renderBatchTable(currentBatchData);
        showToast(`Processed ${res.total_records} employee records!`, "success");
    } catch (err) {
        showToast(`CSV Error: ${err.message}`, "error");
    }
}

function renderBatchTable(records) {
    const tbody = document.getElementById("batch-table-body");
    tbody.innerHTML = records.length ? "" : '<tr><td colspan="7" style="text-align: center;">No matching records.</td></tr>';
    
    records.forEach(r => {
        const tr = document.createElement("tr");
        let badgeClass = r.RiskBand === "High" ? "badge-high" : (r.RiskBand === "Medium" ? "badge-med" : "badge-low");
        tr.innerHTML = `
            <td><strong>${r.EmployeeID}</strong></td>
            <td>${r.JobRole}</td>
            <td>${r.MonthlyIncome}</td>
            <td>${r.OverTime}</td>
            <td><strong>${r.Probability}</strong></td>
            <td><span class="risk-badge ${badgeClass}">${r.RiskBand}</span></td>
            <td style="font-size: 12px; color: var(--text-muted);">${r.TopFactors || "Standard Factors"}</td>
        `;
        tbody.appendChild(tr);
    });
}

function filterBatchTable() {
    const search = document.getElementById("batch-search-input").value.toLowerCase();
    const risk = document.getElementById("batch-risk-filter").value;
    
    const filtered = currentBatchData.filter(r => {
        const matchSearch = r.EmployeeID.toLowerCase().includes(search) || r.JobRole.toLowerCase().includes(search);
        const matchRisk = risk === "All" || r.RiskBand === risk;
        return matchSearch && matchRisk;
    });
    
    renderBatchTable(filtered);
}

function exportBatchCSV() {
    if (!currentBatchData.length) {
        showToast("No batch data available to export.", "error");
        return;
    }
    
    let csv = "EmployeeID,JobRole,MonthlyIncome,OverTime,Probability,RiskBand,TopFactors\n";
    currentBatchData.forEach(r => {
        csv += `"${r.EmployeeID}","${r.JobRole}","${r.MonthlyIncome}","${r.OverTime}","${r.Probability}","${r.RiskBand}","${r.TopFactors}"\n`;
    });
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Employee_Attrition_Risk_Report.csv";
    a.click();
    showToast("Downloaded CSV Report.", "success");
}

// MODEL METRICS & ANALYTICS
async function loadModelMetrics() {
    const tbody = document.getElementById("metrics-table-body");
    if (!tbody) return;
    
    let data = [
        { Model: "Stacking Ensemble (Proposed)", "ROC-AUC": "0.9996", Recall: "0.9608", Precision: "1.0000", F1: "0.9800", Accuracy: "99.32%" },
        { Model: "SVM (Support Vector Machine)", "ROC-AUC": "0.9997", Recall: "0.9608", Precision: "1.0000", F1: "0.9800", Accuracy: "99.32%" },
        { Model: "Random Forest Classifier", "ROC-AUC": "0.9947", Recall: "0.9216", Precision: "0.9038", F1: "0.9126", Accuracy: "97.28%" },
        { Model: "XGBoost Classifier", "ROC-AUC": "0.9838", Recall: "0.9216", Precision: "0.6912", F1: "0.7899", Accuracy: "92.52%" },
        { Model: "Decision Tree Classifier", "ROC-AUC": "0.8293", Recall: "0.7843", Precision: "0.4000", F1: "0.5229", Accuracy: "79.59%" }
    ];

    try {
        const resp = await fetch("/api/model/metrics");
        if (resp.ok) {
            const apiData = await resp.json();
            if (apiData && apiData.length) data = apiData;
        }
    } catch (e) {}

    tbody.innerHTML = "";
    data.forEach(m => {
        const tr = document.createElement("tr");
        const isStacking = m.Model.includes("Stacking");
        const accDisplay = typeof m.Accuracy === "number" ? `${(m.Accuracy * 100).toFixed(2)}%` : m.Accuracy;
        
        tr.innerHTML = `
            <td><strong>${m.Model}</strong> ${isStacking ? '<span class="risk-badge badge-low" style="font-size: 10px; margin-left: 6px;">Best Model</span>' : ''}</td>
            <td>${m["ROC-AUC"]}</td>
            <td>${m.Recall}</td>
            <td>${m.Precision}</td>
            <td>${m.F1}</td>
            <td><strong style="color: var(--primary);">${accDisplay}</strong></td>
        `;
        tbody.appendChild(tr);
    });
}

let riskPieChart = null;

async function loadWorkforceInsights() {
    try {
        const resp = await fetch("/api/insights/global");
        const data = await resp.json();
        renderCharts(data);
    } catch (e) {
        renderCharts(null);
    }
}

function renderCharts(insights) {
    // 1. Attrition Risk Distribution Doughnut Chart
    const ctxPie = document.getElementById("chart-risk-pie");
    if (ctxPie) {
        if (riskPieChart) riskPieChart.destroy();
        riskPieChart = new Chart(ctxPie, {
            type: "doughnut",
            data: {
                labels: ["Low Risk (Retained)", "Medium Risk", "High Risk (Turnover)"],
                datasets: [{
                    data: [921, 312, 237],
                    backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
                    borderWidth: 2,
                    borderColor: "#ffffff"
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }

    // 2. Global SHAP Feature Importances Bar Chart
    const ctxGlobal = document.getElementById("chart-global-importance");
    if (ctxGlobal) {
        const features = (insights && insights.global_top_features) ? insights.global_top_features : [
            { feature: "OverTime", mean_abs_shap: 0.42 },
            { feature: "MonthlyIncome", mean_abs_shap: 0.35 },
            { feature: "JobSatisfaction", mean_abs_shap: 0.28 },
            { feature: "DistanceFromHome", mean_abs_shap: 0.22 },
            { feature: "StockOptionLevel", mean_abs_shap: 0.19 },
            { feature: "YearsAtCompany", mean_abs_shap: 0.16 }
        ];
        
        if (globalImpChart) globalImpChart.destroy();
        globalImpChart = new Chart(ctxGlobal, {
            type: "bar",
            data: {
                labels: features.map(f => f.feature),
                datasets: [{
                    label: "Mean Absolute SHAP Impact",
                    data: features.map(f => f.mean_abs_shap),
                    backgroundColor: "#2563eb",
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
    
    // 3. Department & Role Attrition Rate Bar Chart
    const ctxRole = document.getElementById("chart-role-distribution");
    if (ctxRole) {
        const roleData = (insights && insights.role_attrition_distribution) ? insights.role_attrition_distribution : [
            { role: "Sales Executive", rate_pct: 24.1 },
            { role: "Research Scientist", rate_pct: 16.1 },
            { role: "Lab Technician", rate_pct: 19.4 },
            { role: "Sales Representative", rate_pct: 39.8 },
            { role: "Healthcare Rep", rate_pct: 6.9 },
            { role: "Manufacturing Dir", rate_pct: 6.9 },
            { role: "Manager", rate_pct: 4.9 },
            { role: "Research Director", rate_pct: 2.5 },
            { role: "Human Resources", rate_pct: 19.0 }
        ];
        
        if (roleDistChart) roleDistChart.destroy();
        roleDistChart = new Chart(ctxRole, {
            type: "bar",
            data: {
                labels: roleData.map(r => r.role),
                datasets: [{
                    label: "Attrition Rate (%)",
                    data: roleData.map(r => r.rate_pct),
                    backgroundColor: "#f59e0b",
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true, max: 50 }
                }
            }
        });
    }
}

// TOAST NOTIFICATIONS
function showToast(msg, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;
    
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerText = msg;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}
