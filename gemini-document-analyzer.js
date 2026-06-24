async function analyzeSelectedDocuments(toolName) {

    const checkedDocs = Object.keys(selectedSources)
        .filter(name => selectedSources[name]);

    if (checkedDocs.length === 0) {
        showToast("Select at least one source.", "warning");
        return;
    }

    const targetKey = userApiKey || apiKey;

    if (!targetKey) {
        showToast("Enter Gemini API Key first.", "warning");
        return;
    }

    try {

        let documentText = "";

        checkedDocs.forEach(docName => {

            const pdf =
                filesStore.pdf.find(x => x.name === docName);

            const lab =
                filesStore.labs.find(x => x.name === docName);

            const note =
                filesStore.notes.find(x => x.name === docName);

            if (pdf) {
                documentText += pdf.content + "\n\n";
            }

            if (lab) {
                documentText += lab.content + "\n\n";
            }

            if (note) {
                documentText += note.content + "\n\n";
            }
        });

        const prompt = `
You are MedicareLM.

Analyze the following medical data.

Create:

1. Executive Summary
2. Important Findings
3. Explanation For Patient
4. Possible Causes
5. Questions To Ask Doctor
6. Recommended Next Steps

Medical Data:

${documentText}
`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${targetKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: prompt
                }]
              }]
            })
          }
        );

        const data = await response.json();

        const result =
            data?.candidates?.[0]?.content?.parts?.[0]?.text
            || "No response generated.";

        document.getElementById("view-result").innerHTML = `
        <div class="p-8 bg-white rounded-3xl">
            <pre class="whitespace-pre-wrap">${result}</pre>
        </div>
        `;

        showToast("Gemini analysis complete", "success");

    } catch(err) {

        console.error(err);

        showToast(
          "Gemini analysis failed",
          "error"
        );
    }
}
