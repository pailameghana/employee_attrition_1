// MULTILINGUAL TRANSLATION SYSTEM (ENGLISH, TELUGU, HINDI)
// Explainable Employee Attrition Prediction

const translations = {
    en: {
        app_title: "Explainable Employee Attrition Prediction",
        app_subtitle: "AI-Powered HR Analytics & Retention Decision Support",
        nav_dashboard: "Dashboard",
        nav_predict: "Predict",
        nav_analytics: "Analytics",
        nav_about: "About",
        nav_logout: "Logout",
        
        // Login Page
        login_title: "Explainable Employee Attrition Prediction",
        login_subtitle: "Sign in to access HR attrition risk analytics portal",
        login_email: "Corporate Email / Username",
        login_password: "Password",
        login_btn: "Sign In to Portal",
        login_quick_demo: "Quick Demo Sign-in",
        show_password: "Show",
        hide_password: "Hide",
        
        // Dashboard
        dash_welcome: "Employee Attrition Prediction",
        dash_desc: "Predict whether an employee is likely to leave the organization using employee-related factors.",
        dash_btn_predict: "Start Prediction",
        dash_btn_batch: "Batch Team Audit",
        kpi_total: "Total Analyzed",
        kpi_high: "High Risk Employees",
        kpi_med: "Medium Risk Employees",
        kpi_low: "Low Risk Employees",
        kpi_accuracy: "Model Accuracy",
        
        // Presets
        presets_label: "Sample Profiles:",
        preset_high: "High Risk Sample",
        preset_low: "Low Risk Sample",
        preset_exec: "Executive Sample",
        
        // Form Sections
        form_title: "Employee Information Form",
        section_personal: "Personal & Role Details",
        section_comp: "Compensation & Work Hours",
        section_satisfaction: "Satisfaction & Work-Life",
        section_tenure: "Experience & Tenure",
        
        // Form Fields
        field_age: "Age (Years)",
        field_dept: "Department",
        field_role: "Job Role",
        field_income: "Monthly Income ($)",
        field_job_level: "Job Level",
        field_job_sat: "Job Satisfaction (1-4)",
        field_wlb: "Work-Life Balance (1-4)",
        field_overtime: "Overtime Work",
        field_tenure_company: "Years at Company",
        field_tenure_role: "Years in Current Role",
        field_tenure_manager: "Years with Current Manager",
        field_total_years: "Total Working Years",
        field_companies: "Number of Companies Worked",
        field_perf_rating: "Performance Rating",
        field_stock_level: "Stock Option Level",
        field_distance: "Distance From Home (km)",
        field_marital: "Marital Status",
        field_travel: "Business Travel",
        field_education: "Education Level",
        field_gender: "Gender",
        
        btn_predict: "Predict Attrition Risk",
        
        // Results & Explainability
        res_header: "Prediction Result",
        risk_high: "High Risk of Attrition",
        risk_med: "Medium Risk of Attrition",
        risk_low: "Low Risk of Attrition",
        prob_label: "Attrition Probability:",
        
        why_heading: "Why is this employee likely to leave?",
        why_disclaimer: "The prediction is based on the employee information entered above. The factors shown here explain which employee characteristics contributed most to the prediction.",
        factors_increase: "Main Factors Increasing Attrition Risk",
        factors_reduce: "Factors Reducing Attrition Risk",
        
        summary_heading: "Employee Risk Summary",
        summary_main_factor: "Main Risk Factor:",
        summary_sec_factor: "Secondary Risk Factor:",
        summary_hr_action: "Recommended HR Attention:",
        decision_support_notice: "Decision-Support Notice: This application is designed to assist HR analysis and workforce planning. Predictions are estimates based on available employee data and should not be used as the sole basis for employment decisions.",
        
        hr_review_heading: "Possible Areas for HR Review",
        hr_review_desc: "Based on the identified risk factors, HR may consider reviewing:",
        hr_area_workload: "• Workload and Overtime Commitments",
        hr_area_compensation: "• Compensation and Salary Competitiveness",
        hr_area_satisfaction: "• Job and Work Environment Satisfaction",
        hr_area_wlb: "• Work-Life Balance Flexibility",
        hr_area_growth: "• Career Growth & Promotion Opportunities",
        hr_area_manager: "• Managerial Support & Relationships",
        
        // Batch Audit
        batch_title: "Multiple Employee Comparison (Batch Upload)",
        batch_upload_desc: "Upload a CSV file containing multiple employee records to run batch risk assessment.",
        batch_btn_sample: "Run Sample Batch Assessment",
        batch_search: "Search Employee ID or Role...",
        batch_filter_risk: "Filter by Risk",
        batch_export: "Export Results to CSV",
        
        // About Model
        about_title: "About the Explainable Prediction Model",
        about_q1: "What does this application do?",
        about_a1: "It uses machine learning to estimate whether an employee may be at risk of leaving the organization and explains why.",
        about_q2: "How does it work?",
        about_step1: "1. HR enters employee information.",
        about_step2: "2. Machine learning model analyzes employee characteristics.",
        about_step3: "3. System predicts attrition probability percentage.",
        about_step4: "4. SHAP engine explains major factors behind the prediction.",
        about_step5: "5. HR uses explanations as decision-support information.",
        about_tech_title: "Technologies Used",
        responsible_notice_title: "Responsible Use Notice",
        responsible_notice_text: "This application is designed to support HR analysis and workforce planning. Predictions are estimates based on available employee data and should not be used as the sole basis for employment decisions. HR professionals should consider employee context and other relevant qualitative information."
    },
    
    te: {
        app_title: "ఉద్యోగుల నిష్క్రమణ విశ్లేషణ మరియు అంచనా",
        app_subtitle: "AI ఆధారిత HR విశ్లేషణలు & నిలకడ నిర్ణయ మద్దతు వ్యవస్థ",
        nav_dashboard: "డాష్‌బోర్డ్",
        nav_predict: "అంచనా వేయండి",
        nav_analytics: "విశ్లేషణలు",
        nav_about: "గురించి",
        nav_logout: "లాగౌట్",
        
        // Login Page
        login_title: "ఉద్యోగుల నిష్క్రమణ విశ్లేషణ మరియు అంచనా",
        login_subtitle: "HR అట్రిషన్ రిస్క్ అనలిటిక్స్ పోర్టల్‌ను పొందడానికి లాగిన్ చేయండి",
        login_email: "కార్పొరేట్ ఇమెయిల్ / యూజర్ నేమ్",
        login_password: "పాస్‌వర్డ్",
        login_btn: "పోర్టల్‌లోకి ప్రవేశించండి",
        login_quick_demo: "త్వరిత డెమో లాగిన్",
        show_password: "చూపించు",
        hide_password: "దాచు",
        
        // Dashboard
        dash_welcome: "ఉద్యోగుల అట్రిషన్ అంచనా",
        dash_desc: "ఉద్యోగికి సంబంధించిన అంశాలను ఉపయోగించి ఉద్యోగి సంస్థ నుండి వెళ్ళిపోయే అవకాశం ఉందో లేదో అంచనా వేయండి.",
        dash_btn_predict: "అంచనా ప్రారంభించండి",
        dash_btn_batch: "టీమ్ బ్యాచ్ ఆడిట్",
        kpi_total: "మొత్తం విశ్లేషించినవి",
        kpi_high: "అధిక రిస్క్ ఉద్యోగులు",
        kpi_med: "మధ్యస్థ రిస్క్ ఉద్యోగులు",
        kpi_low: "తక్కువ రిస్క్ ఉద్యోగులు",
        kpi_accuracy: "మోడల్ ఖచ్చితత్వం",
        
        // Presets
        presets_label: "నమూనా ప్రొఫైల్స్:",
        preset_high: "అధిక రిస్క్ నమూనా",
        preset_low: "తక్కువ రిస్క్ నమూనా",
        preset_exec: "ఎగ్జిక్యూటివ్ నమూనా",
        
        // Form Sections
        form_title: "ఉద్యోగి సమాచార ఫారమ్",
        section_personal: "వ్యక్తిగత & హోదా వివరాలు",
        section_comp: "జీతం & పని వేళలు",
        section_satisfaction: "సంతృప్తి & వర్క్-లైఫ్",
        section_tenure: "అనుభవం & సర్వీస్",
        
        // Form Fields
        field_age: "వయస్సు (సంవత్సరాలు)",
        field_dept: "శాఖ (డిపార్ట్‌మెంట్)",
        field_role: "ఉద్యోగ హోదా",
        field_income: "నెలకు జీతం ($)",
        field_job_level: "ఉద్యోగ స్థాయి",
        field_job_sat: "ఉద్యోగ సంతృప్తి (1-4)",
        field_wlb: "వర్క్-లైఫ్ బ్యాలెన్స్ (1-4)",
        field_overtime: "ఓవర్‌టైమ్ పని",
        field_tenure_company: "సంస్థలో గడిపిన సంవత్సరాలు",
        field_tenure_role: "ప్రస్తుత హోదాలో సంవత్సరాలు",
        field_tenure_manager: "ప్రస్తుత మేనేజర్‌తో సంవత్సరాలు",
        field_total_years: "మొత్తం పని చేసిన అనుభవం",
        field_companies: "పనిచేసిన కంపెనీల సంఖ్య",
        field_perf_rating: "పనితీరు రేటింగ్",
        field_stock_level: "స్టాక్ ఆప్షన్ స్థాయి",
        field_distance: "ఇంటి నుండి దూరం (కిమీ)",
        field_marital: "వైవాహిక స్థితి",
        field_travel: "బిజినెస్ ట్రావెల్",
        field_education: "విద్యార్హత",
        field_gender: "లింగం",
        
        btn_predict: "అట్రిషన్ రిస్క్‌ను అంచనా వేయండి",
        
        // Results & Explainability
        res_header: "అంచనా ఫలితం",
        risk_high: "అధిక నిష్క్రమణ రిస్క్ (High Risk)",
        risk_med: "మధ్యస్థ నిష్క్రమణ రిస్క్ (Medium Risk)",
        risk_low: "తక్కువ నిష్క్రమణ రిస్క్ (Low Risk)",
        prob_label: "నిష్క్రమణ సంభావ్యత:",
        
        why_heading: "ఈ ఉద్యోగి ఎందుకు వెళ్ళిపోయే అవకాశం ఉంది?",
        why_disclaimer: "ఈ అంచనా పైన నమోదు చేసిన వివరాల ఆధారంగా చేయబడింది. ఇక్కడ చూపిన కారణాలు ఏ అంశాలు ఈ నిర్ణయానికి కారణమయ్యాయో వివరిస్తాయి.",
        factors_increase: "రిస్క్ పెంచే ముఖ్య కారణాలు",
        factors_reduce: "రిస్క్ తగ్గించే అనుకూల కారణాలు",
        
        summary_heading: "ఉద్యోగి రిస్క్ సారాంశం",
        summary_main_factor: "ముఖ్య కారణం:",
        summary_sec_factor: "రెండవ కారణం:",
        summary_hr_action: "HR సూచించిన చర్యలు:",
        decision_support_notice: "గమనిక: ఈ అప్లికేషన్ HR నిర్ణయాలకు మద్దతుగా మాత్రమే రూపొందించబడింది. ఉద్యోగ నిర్ణయాలకు ఇది ఒక్కటే ప్రమాణం కాకూడదు.",
        
        hr_review_heading: "HR పరిశీలించదగిన రంగాలు",
        hr_review_desc: "గుర్తించిన రిస్క్ అంశాల ఆధారంగా HR ఈ క్రింది అంశాలను పరిశీలించవచ్చు:",
        hr_area_workload: "• పనిభారం మరియు ఓవర్‌టైమ్ వేళలు",
        hr_area_compensation: "• జీతం మరియు పరిహార పోటీతత్వం",
        hr_area_satisfaction: "• ఉద్యోగ మరియు పని వాతావరణ సంతృప్తి",
        hr_area_wlb: "• వర్క్-లైఫ్ బ్యాలెన్స్ సదుపాయాలు",
        hr_area_growth: "• కెరీర్ ఎదుగుదల & ప్రమోషన్ అవకాశాలు",
        hr_area_manager: "• మేనేజర్ మద్దతు & సంబంధాలు",
        
        // Batch Audit
        batch_title: "బహుళ ఉద్యోగుల పోలిక (బ్యాచ్ అప్‌లోడ్)",
        batch_upload_desc: "బహుళ ఉద్యోగుల వివరాలతో కూడిన CSV ఫైల్‌ను అప్‌లోడ్ చేసి ఆడిట్ నిర్వహించండి.",
        batch_btn_sample: "నమూనా బ్యాచ్ అసెస్‌మెంట్ రన్ చేయండి",
        batch_search: "ఉద్యోగి ఐడి లేదా హోదా ద్వారా శోధించండి...",
        batch_filter_risk: "రిస్క్ ఆధారంగా ఫిల్టర్ చేయండి",
        batch_export: "ఫలితాలను CSV గా డౌన్‌లోడ్ చేయండి",
        
        // About Model
        about_title: "వివరణాత్మక అంచనా మోడల్ గురించి",
        about_q1: "ఈ అప్లికేషన్ ఏమి చేస్తుంది?",
        about_a1: "ఇది మిషన్ లెర్నింగ్ ఉపయోగించి ఉద్యోగి సంస్థ నుండి వెళ్లిపోయే అవకాశం ఉందో లేదో అంచనా వేస్తుంది మరియు కారణాలను వివరిస్తుంది.",
        about_q2: "ఇది ఎలా పనిచేస్తుంది?",
        about_step1: "1. HR ఉద్యోగి వివరాలను నమోదు చేస్తారు.",
        about_step2: "2. మిషన్ లెర్నింగ్ మోడల్ వివరాలను విశ్లేషిస్తుంది.",
        about_step3: "3. వ్యవస్థ నిష్క్రమణ సంభావ్యత శాతాన్ని అంచనా వేస్తుంది.",
        about_step4: "4. SHAP ఇంజిన్ ముఖ్య కారణాలను వివరిస్తుంది.",
        about_step5: "5. HR ఈ వివరాలను నిర్ణయ మద్దతు సమాచారంగా ఉపయోగిస్తారు.",
        about_tech_title: "ఉపయోగించిన సాంకేతికతలు",
        responsible_notice_title: "బాధ్యతాయుత ఉపయోగ నోటీసు",
        responsible_notice_text: "ఈ అప్లికేషన్ HR విశ్లేషణ మరియు ప్రణాళికకు మద్దతు ఇచ్చేందుకు రూపొందించబడింది. ఇది తుది నిర్ణయం కాదు, మద్దతు సమాచారం మాత్రమే."
    },
    
    hi: {
        app_title: "व्याख्यायोग्य कर्मचारी बाह्यगमन पूर्वानुमान",
        app_subtitle: "AI-संचालित HR एनालिटिक्स और रिटेंशन निर्णय सहायता",
        nav_dashboard: "डैशबोर्ड",
        nav_predict: "पूर्वानुमान",
        nav_analytics: "विश्लेषण",
        nav_about: "विवरण",
        nav_logout: "लॉगआउट",
        
        // Login Page
        login_title: "व्याख्यायोग्य कर्मचारी बाह्यगमन पूर्वानुमान",
        login_subtitle: "HR एट्रिशन जोखिम एनालिटिक्स पोर्टल तक पहुँचने के लिए लॉगिन करें",
        login_email: "कॉर्पोरेट ईमेल / उपयोगकर्ता नाम",
        login_password: "पासवर्ड",
        login_btn: "पोर्टल में साइन इन करें",
        login_quick_demo: "त्वरित डेमो लॉगिन",
        show_password: "देखें",
        hide_password: "छिपाएं",
        
        // Dashboard
        dash_welcome: "कर्मचारी एट्रिशन पूर्वानुमान",
        dash_desc: "कर्मचारी-संबंधित कारकों का उपयोग करके पूर्वानुमान लगाएं कि क्या कोई कर्मचारी संगठन छोड़ने की संभावना रखता है।",
        dash_btn_predict: "पूर्वानुमान शुरू करें",
        dash_btn_batch: "टीम बैच ऑडिट",
        kpi_total: "कुल विश्लेषण",
        kpi_high: "उच्च जोखिम कर्मचारी",
        kpi_med: "मध्यम जोखिम कर्मचारी",
        kpi_low: "कम जोखिम कर्मचारी",
        kpi_accuracy: "मॉडल सटीकता",
        
        // Presets
        presets_label: "नमूना प्रोफ़ाइल:",
        preset_high: "उच्च जोखिम नमूना",
        preset_low: "कम जोखिम नमूना",
        preset_exec: "कार्यकारी नमूना",
        
        // Form Sections
        form_title: "कर्मचारी सूचना प्रपत्र",
        section_personal: "व्यक्तिगत एवं भूमिका विवरण",
        section_comp: "मुआवजा एवं कार्य घंटे",
        section_satisfaction: "संतोष एवं कार्य-जीवन संतुलन",
        section_tenure: "अनुभव एवं सेवा काल",
        
        // Form Fields
        field_age: "आयु (वर्ष)",
        field_dept: "विभाग",
        field_role: "कार्य भूमिका",
        field_income: "मासिक आय ($)",
        field_job_level: "नौकरी का स्तर",
        field_job_sat: "कार्य संतोष (1-4)",
        field_wlb: "कार्य-जीवन संतुलन (1-4)",
        field_overtime: "ओवरटाइम कार्य",
        field_tenure_company: "कंपनी में वर्ष",
        field_tenure_role: "वर्तमान भूमिका में वर्ष",
        field_tenure_manager: "वर्तमान प्रबंधक के साथ वर्ष",
        field_total_years: "कुल कार्य अनुभव वर्ष",
        field_companies: "कार्यरत कंपनियों की संख्या",
        field_perf_rating: "प्रदर्शन रेटिंग",
        field_stock_level: "स्टॉक विकल्प स्तर",
        field_distance: "घर से दूरी (किमी)",
        field_marital: "वैवाहिक स्थिति",
        field_travel: "व्यावसायिक यात्रा",
        field_education: "शिक्षा स्तर",
        field_gender: "लिंग",
        
        btn_predict: "एट्रिशन जोखिम का पूर्वानुमान करें",
        
        // Results & Explainability
        res_header: "पूर्वानुमान परिणाम",
        risk_high: "उच्च एट्रिशन जोखिम (High Risk)",
        risk_med: "मध्यम एट्रिशन जोखिम (Medium Risk)",
        risk_low: "कम एट्रिशन जोखिम (Low Risk)",
        prob_label: "एट्रिशन संभावना:",
        
        why_heading: "यह कर्मचारी कंपनी क्यों छोड़ सकता है?",
        why_disclaimer: "यह पूर्वानुमान ऊपर दर्ज की गई जानकारी पर आधारित है। यहाँ दिखाए गए कारक स्पष्ट करते हैं कि किन विशेषताओं ने इस परिणाम में योगदान दिया।",
        factors_increase: "जोखिम बढ़ाने वाले प्रमुख कारक",
        factors_reduce: "जोखिम घटाने वाले सकारात्मक कारक",
        
        summary_heading: "कर्मचारी जोखिम सारांश",
        summary_main_factor: "मुख्य जोखिम कारक:",
        summary_sec_factor: "द्वितीयक जोखिम कारक:",
        summary_hr_action: "अनुशंसित HR ध्यान:",
        decision_support_notice: "निर्णय सहायता सूचना: यह एप्लिकेशन केवल HR निर्णय सहायता के लिए डिज़ाइन किया गया है। यह रोजगार निर्णयों का एकमात्र आधार नहीं होना चाहिए।",
        
        hr_review_heading: "HR समीक्षा के संभावित क्षेत्र",
        hr_review_desc: "पहचाने गए जोखिम कारकों के आधार पर HR निम्नलिखित क्षेत्रों की समीक्षा कर सकता है:",
        hr_area_workload: "• कार्यभार और ओवरटाइम अवधि",
        hr_area_compensation: "• मुआवजा और वेतन प्रतिस्पर्धात्मकता",
        hr_area_satisfaction: "• नौकरी और कार्य वातावरण संतोष",
        hr_area_wlb: "• कार्य-जीवन संतुलन लचीलापन",
        hr_area_growth: "• करियर वृद्धि और पदोन्नति के अवसर",
        hr_area_manager: "• प्रबंधकीय सहयोग और संबंध",
        
        // Batch Audit
        batch_title: "बहु-कर्मचारी तुलना (बैच अपलोड)",
        batch_upload_desc: "बैच जोखिम मूल्यांकन चलाने के लिए कर्मचारियों के डेटा वाली CSV फ़ाइल अपलोड करें।",
        batch_btn_sample: "नमूना बैच मूल्यांकन चलाएं",
        batch_search: "कर्मचारी आईडी या भूमिका द्वारा खोजें...",
        batch_filter_risk: "जोखिम के आधार पर फ़िल्टर करें",
        batch_export: "परिणामों को CSV में निर्यात करें",
        
        // About Model
        about_title: "व्याख्यायोग्य पूर्वानुमान मॉडल के बारे में",
        about_q1: "यह एप्लिकेशन क्या करता है?",
        about_a1: "यह मशीन लर्निंग का उपयोग करके अनुमान लगाता है कि क्या कोई कर्मचारी संगठन छोड़ने के जोखिम में है और कारण स्पष्ट करता है।",
        about_q2: "यह कैसे काम करता है?",
        about_step1: "1. HR कर्मचारी की जानकारी दर्ज करता है।",
        about_step2: "2. मशीन लर्निंग मॉडल जानकारी का विश्लेषण करता है।",
        about_step3: "3. सिस्टम एट्रिशन संभावना प्रतिशत का पूर्वानुमान लगाता है।",
        about_step4: "4. SHAP इंजन प्रमुख कारणों की व्याख्या करता है।",
        about_step5: "5. HR इस जानकारी का उपयोग निर्णय सहायता के रूप में करता है।",
        about_tech_title: "उपयोग की गई तकनीकें",
        responsible_notice_title: "उत्तरदायी उपयोग सूचना",
        responsible_notice_text: "यह एप्लिकेशन HR विश्लेषण और योजना का समर्थन करने के लिए डिज़ाइन किया गया है। यह केवल एक सहायक उपकरण है।"
    }
};

let currentLang = "en";

function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    
    // Update active state in selector
    const selector = document.getElementById("language-selector");
    if (selector) selector.value = lang;
    
    // Update all elements with data-i18n attribute
    const elements = document.querySelectorAll("[data-i18n]");
    elements.forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (translations[lang][key]) {
            if (el.tagName === "INPUT" && el.hasAttribute("placeholder")) {
                el.placeholder = translations[lang][key];
            } else {
                el.innerText = translations[lang][key];
            }
        }
    });
}
