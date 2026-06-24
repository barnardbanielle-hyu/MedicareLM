/* =====================================================
   MedicareLM Security Layer v1.0
   Demo & Workshop Edition
   ===================================================== */

(function () {

    console.log("MedicareLM Security Layer Loaded");

    window.MedicareSecurity = {

        VERSION: "1.0",

        MAX_FILE_SIZE: 10 * 1024 * 1024,

        ALLOWED_TYPES: [
            "application/pdf",
            "image/png",
            "image/jpeg",
            "image/jpg"
        ],

        validateGeminiKey(key) {

            if (!key) {
                return {
                    valid: false,
                    message: "Gemini API Key Required"
                };
            }

            if (!key.startsWith("AIza")) {
                return {
                    valid: false,
                    message: "Invalid Gemini API Key Format"
                };
            }

            return {
                valid: true,
                message: "Gemini API Key Valid"
            };
        },

        saveApiKey(key) {

            try {

                localStorage.setItem(
                    "medicarelm_api_key",
                    key
                );

                this.log(
                    "API_KEY_SAVED",
                    "User saved Gemini API Key"
                );

                return true;

            } catch (error) {

                console.error(error);

                return false;
            }
        },

        getApiKey() {

            return (
                localStorage.getItem(
                    "medicarelm_api_key"
                ) || ""
            );
        },

        clearApiKey() {

            localStorage.removeItem(
                "medicarelm_api_key"
            );

            this.log(
                "API_KEY_REMOVED",
                "User removed Gemini API Key"
            );
        },

        validateFile(file) {

            if (!file) {

                return {
                    valid: false,
                    message: "No file selected"
                };
            }

            if (
                !this.ALLOWED_TYPES.includes(
                    file.type
                )
            ) {

                return {
                    valid: false,
                    message:
                        "Only PDF, JPG and PNG files are allowed"
                };
            }

            if (
                file.size >
                this.MAX_FILE_SIZE
            ) {

                return {
                    valid: false,
                    message:
                        "Maximum file size is 10MB"
                };
            }

            return {
                valid: true,
                message: "File accepted"
            };
        },

        sanitizePrompt(text) {

            if (!text) return "";

            const patterns = [

                /ignore previous instructions/gi,

                /ignore all instructions/gi,

                /system prompt/gi,

                /developer message/gi,

                /act as/gi,

                /override instructions/gi,

                /reveal hidden prompt/gi,

                /show hidden instructions/gi
            ];

            let cleaned = text;

            patterns.forEach(pattern => {

                cleaned =
                    cleaned.replace(
                        pattern,
                        ""
                    );
            });

            return cleaned;
        },

        sanitizeHtml(text) {

            if (!text) return "";

            const div =
                document.createElement("div");

            div.textContent = text;

            return div.innerHTML;
        },

        sanitizeDocument(text) {

            if (!text) return "";

            return text
                .replace(
                    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
                    ""
                )
                .replace(
                    /javascript:/gi,
                    ""
                )
                .replace(
                    /onerror=/gi,
                    ""
                )
                .replace(
                    /onclick=/gi,
                    ""
                );
        },

        createReportDisclaimer() {

            return `
            <div style="
                margin-top:20px;
                padding:15px;
                border-radius:12px;
                border:1px solid #dbeafe;
                background:#eff6ff;
                font-size:12px;
                line-height:1.6;
            ">
                <strong>Important Notice</strong><br><br>

                MedicareLM provides AI-assisted analysis
                for educational purposes only.

                Results may contain inaccuracies.

                Always consult a licensed healthcare
                professional before making medical
                decisions.

                This demo is not HIPAA certified,
                FDA approved or intended for clinical
                diagnosis.
            </div>
            `;
        },

        confidenceScore(text) {

            if (!text) return "Low";

            if (
                text.includes("possible") ||
                text.includes("may") ||
                text.includes("could")
            ) {
                return "Moderate";
            }

            return "High";
        },

        log(action, details) {

            try {

                const logs =
                    JSON.parse(
                        localStorage.getItem(
                            "medicarelm_logs"
                        ) || "[]"
                    );

                logs.push({
                    action,
                    details,
                    timestamp:
                        new Date().toISOString()
                });

                localStorage.setItem(
                    "medicarelm_logs",
                    JSON.stringify(logs)
                );

            } catch (e) {

                console.warn(
                    "Logging unavailable"
                );
            }
        },

        getLogs() {

            try {

                return JSON.parse(
                    localStorage.getItem(
                        "medicarelm_logs"
                    ) || "[]"
                );

            } catch {

                return [];
            }
        },

        exportLogs() {

            const logs =
                JSON.stringify(
                    this.getLogs(),
                    null,
                    2
                );

            const blob =
                new Blob(
                    [logs],
                    {
                        type:
                            "application/json"
                    }
                );

            const a =
                document.createElement("a");

            a.href =
                URL.createObjectURL(blob);

            a.download =
                "MedicareLM_Audit_Log.json";

            a.click();
        },

        showPrivacyNotice() {

            alert(`
MedicareLM Demo Version

Documents remain in your browser.

AI reports may contain errors.

Do not upload highly sensitive
medical records.

Always consult a physician.
            `);
        }
    };

})();
