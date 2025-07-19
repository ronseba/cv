document.addEventListener('DOMContentLoaded', () => {
    const templateSelect = document.getElementById('template-select');
    const profilePictureInput = document.getElementById('profile-picture');
    const profilePicDisplay = document.getElementById('profile-pic-display');
    const previewArea = document.getElementById('preview-area');
    const downloadCvBtn = document.getElementById('download-cv-btn');
    const loadingOverlay = document.getElementById('loading-overlay');

    // Dynamic section buttons
    const addExperienceBtn = document.getElementById('add-experience-btn');
    const addEducationBtn = document.getElementById('add-education-btn');
    const addProjectBtn = document.getElementById('add-project-btn');

    // Skills input
    const skillsInput = document.getElementById('skills-input');
    const skillsDisplay = document.getElementById('skills-display');

    let profilePicBase64 = ''; // To store base64 image data
    let currentSkills = new Set(); // Use a Set for unique skills
    let fetchedTemplates = {}; // Cache for fetched template HTML content

    // --- Configuration: GitHub Pages URL for templates ---
    // IMPORTANT: Replace this with the actual URL to your "templates" folder hosted on GitHub Pages.
    // Example: "https://your-github-username.github.io/your-repo-name/templates/"
    // Make sure it ends with a slash!
    const TEMPLATES_BASE_URL = 'YOUR_GITHUB_PAGES_TEMPLATES_URL_HERE/';
    console.log('TEMPLATES_BASE_URL set to:', TEMPLATES_BASE_URL);


    // --- Show/Hide Loading Overlay ---
    function showLoading() {
        loadingOverlay.classList.add('visible');
    }

    function hideLoading() {
        loadingOverlay.classList.remove('visible');
    }

    // --- Template Fetching Function ---
    async function fetchTemplate(templateName) {
        if (fetchedTemplates[templateName]) {
            return fetchedTemplates[templateName]; // Return from cache if available
        }
        try {
            const response = await fetch(`${TEMPLATES_BASE_URL}${templateName}.html`);
            if (!response.ok) {
                throw new Error(`Failed to fetch template: ${templateName}.html (${response.status} ${response.statusText})`);
            }
            const htmlContent = await response.text();
            fetchedTemplates[templateName] = htmlContent; // Store in cache
            return htmlContent;
        } catch (error) {
            console.error('Error fetching template:', error);
            alert(`Could not load template "${templateName}". Please check the TEMPLATES_BASE_URL in script.js and ensure templates are accessible.`);
            return null;
        }
    }

    // --- Event Listeners for Real-time Preview ---
    document.querySelectorAll('input, textarea').forEach(input => { // Select and input/textarea
        input.addEventListener('input', updatePreview);
        input.addEventListener('change', updatePreview); // For month inputs
    });
    templateSelect.addEventListener('change', updatePreview); // Listen for template changes explicitly

    // --- Profile Picture Handling ---
    profilePictureInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                profilePicBase64 = e.target.result; // Store base64 string
                profilePicDisplay.src = profilePicBase64; // Update image preview
                updatePreview();
            };
            reader.readAsDataURL(file);
        } else {
            profilePicBase64 = '';
            profilePicDisplay.src = 'https://placehold.co/128x128/E0E7FF/3366FF?text=128x128'; // Reset to placeholder
            updatePreview();
        }
    });

    // --- Dynamic Section Management (Work Experience, Education, Projects) ---
    function addDynamicEntry(sectionId, templateFn, type) {
        const container = document.getElementById(sectionId);
        // Find the correct index by counting existing dynamic-entry-block elements
        const currentIndex = container.querySelectorAll(`.${type}-entry`).length;

        const newEntryHtml = templateFn(currentIndex);
        const newDiv = document.createElement('div');
        newDiv.innerHTML = newEntryHtml;
        newDiv.classList.add(`${type}-entry`, 'dynamic-entry-block');
        container.insertBefore(newDiv, container.lastElementChild); // Insert before the add button

        // Re-attach event listeners to new inputs within the new block
        newDiv.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', updatePreview);
            input.addEventListener('change', updatePreview);
        });
        
        // Add remove button listener for the new block
        newDiv.querySelector('.remove-entry-btn')?.addEventListener('click', (e) => {
            newDiv.remove();
            updatePreview(); // Update preview after removal
        });
        updatePreview();
    }

    addExperienceBtn.addEventListener('click', () => addDynamicEntry('work-experience-section', getExperienceEntryHtml, 'experience'));
    addEducationBtn.addEventListener('click', () => addDynamicEntry('education-section', getEducationEntryHtml, 'education'));
    addProjectBtn.addEventListener('click', () => addDynamicEntry('projects-section', getProjectEntryHtml, 'project'));

    // Templates for new dynamic entries (for frontend input fields)
    function getExperienceEntryHtml(index) {
        return `
            <div class="form-group">
                <label for="job-title-${index}" class="input-label">Job Title</label>
                <input type="text" id="job-title-${index}" class="form-input" placeholder="Job Title">
            </div>
            <div class="form-group">
                <label for="company-${index}" class="input-label">Company</label>
                <input type="text" id="company-${index}" class="form-input" placeholder="Company Name">
            </div>
            <div class="form-row">
                <div class="form-group half-width">
                    <label for="start-date-${index}" class="input-label">Start Date</label>
                    <input type="month" id="start-date-${index}" class="form-input">
                </div>
                <div class="form-group half-width">
                    <label for="end-date-${index}" class="input-label">End Date</label>
                    <input type="month" id="end-date-${index}" class="form-input">
                </div>
            </div>
            <div class="form-group">
                <label for="description-${index}" class="input-label">Description</label>
                <textarea id="description-${index}" rows="3" class="form-input" placeholder="Key responsibilities and achievements."></textarea>
            </div>
            <button type="button" class="remove-entry-btn danger-btn" data-type="experience">Remove Experience</button>
        `;
    }

    function getEducationEntryHtml(index) {
        return `
            <div class="form-group">
                <label for="degree-${index}" class="input-label">Degree / Certificate</label>
                <input type="text" id="degree-${index}" class="form-input" placeholder="Degree, CGPA">
            </div>
            <div class="form-group">
                <label for="institution-${index}" class="input-label">Institution</label>
                <input type="text" id="institution-${index}" class="form-input" placeholder="University Name">
            </div>
            <div class="form-group">
                <label for="edu-period-${index}" class="input-label">Period</label>
                <input type="text" id="edu-period-${index}" class="form-input" placeholder="e.g., 2022 - 2025">
            </div>
            <button type="button" class="remove-entry-btn danger-btn" data-type="education">Remove Education</button>
        `;
    }

    function getProjectEntryHtml(index) {
        return `
            <div class="form-group">
                <label for="project-name-${index}" class="input-label">Project Name</label>
                <input type="text" id="project-name-${index}" class="form-input" placeholder="Project Name">
            </div>
            <div class="form-group">
                <label for="project-link-${index}" class="input-label">Project Link (Optional)</label>
                <input type="url" id="project-link-${index}" class="form-input" placeholder="https://example.com/my-project">
            </div>
            <div class="form-group">
                <label for="project-description-${index}" class="input-label">Description</label>
                <textarea id="project-description-${index}" rows="3" class="form-input" placeholder="Describe your role and technologies used."></textarea>
            </div>
            <button type="button" class="remove-entry-btn danger-btn" data-type="project">Remove Project</button>
        `;
    }


    // --- Skill Tag Management ---
    // Initialize skills from pre-existing HTML
    skillsDisplay.querySelectorAll('.skill-tag').forEach(tag => {
        const skillText = tag.firstChild.textContent.trim();
        currentSkills.add(skillText);
        tag.querySelector('.remove-skill').addEventListener('click', (e) => removeSkill(skillText, e.target.parentElement));
    });


    skillsInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && skillsInput.value.trim() !== '') {
            e.preventDefault(); // Prevent form submission
            addSkill(skillsInput.value.trim());
            skillsInput.value = ''; // Clear input
            updatePreview();
        }
    });

    function addSkill(skill) {
        if (!currentSkills.has(skill)) {
            currentSkills.add(skill);
            const skillTag = document.createElement('span');
            skillTag.classList.add('skill-tag');
            skillTag.innerHTML = `${skill} <span class="remove-skill">x</span>`;
            skillsDisplay.appendChild(skillTag);
            skillTag.querySelector('.remove-skill').addEventListener('click', (e) => removeSkill(skill, skillTag));
        }
    }

    function removeSkill(skill, tagElement) {
        currentSkills.delete(skill);
        tagElement.remove();
        updatePreview();
    }


    // --- Collect All Form Data ---
    function collectFormData() {
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value, // This is LinkedIn/Address
            summary: document.getElementById('summary').value,
            selectedTemplate: templateSelect.value,
            profilePicture: profilePicBase64,
            skills: Array.from(currentSkills).join(', '), // Join skills with comma
            certifications: document.getElementById('certifications-input')?.value || ''
        };

        // Collect dynamic Work Experience
        const experiences = [];
        document.querySelectorAll('#work-experience-section .experience-entry').forEach((entry) => {
            const jobTitle = entry.querySelector(`[id^="job-title-"]`)?.value || ''; // Use attribute selector for robustness
            const company = entry.querySelector(`[id^="company-"]`)?.value || '';
            const startDate = entry.querySelector(`[id^="start-date-"]`)?.value || '';
            const endDate = entry.querySelector(`[id^="end-date-"]`)?.value || '';
            const description = entry.querySelector(`[id^="description-"]`)?.value || '';
            if (jobTitle || company || startDate || endDate || description) {
                experiences.push({ jobTitle, company, startDate, endDate, description });
            }
        });
        formData.experience = experiences; // Keep as array for frontend processing

        // Collect dynamic Education
        const educations = [];
        document.querySelectorAll('#education-section .education-entry').forEach((entry) => {
            const degree = entry.querySelector(`[id^="degree-"]`)?.value || '';
            const institution = entry.querySelector(`[id^="institution-"]`)?.value || '';
            const period = entry.querySelector(`[id^="edu-period-"]`)?.value || '';
            if (degree || institution || period) {
                educations.push({ degree, institution, period });
            }
        });
        formData.education = educations; // Keep as array for frontend processing

        // Collect dynamic Projects
        const projects = [];
        document.querySelectorAll('#projects-section .project-entry').forEach((entry) => {
            const projectName = entry.querySelector(`[id^="project-name-"]`)?.value || '';
            const projectLink = entry.querySelector(`[id^="project-link-"]`)?.value || '';
            const projectDescription = entry.querySelector(`[id^="project-description-"]`)?.value || '';
            if (projectName || projectLink || projectDescription) {
                projects.push({ projectName, projectLink, projectDescription });
            }
        });
        formData.projects = projects; // Keep as array for frontend processing

        return formData;
    }

    // --- Helper Functions to Generate HTML for Dynamic Sections (for PDF) ---
    // These functions build the HTML snippets injected into the main template string
    function generateExperienceHtmlForPdf(experiences) {
        if (!experiences || experiences.length === 0) return '';
        const itemsHtml = experiences.map(job => `
            <div class="item">
                <h4>${job.jobTitle || ''} <span class="dates">${job.startDate || ''} - ${job.endDate || ''}</span></h4>
                <p class="sub">${job.company || ''}</p>
                <p>${job.description || ''}</p>
            </div>
        `).join('');
        return `<div class="section"><h3 class="section-title">WORK EXPERIENCE</h3>${itemsHtml}</div>`;
    }

    function generateEducationHtmlForPdf(educations) {
        if (!educations || educations.length === 0) return '';
        const itemsHtml = educations.map(edu => `
            <div class="item">
                <h4>${edu.degree || ''}</h4>
                <p class="sub">${edu.institution || ''}</p>
                <p>${edu.period || ''}</p>
            </div>
        `).join('');
        return `<div class="section"><h3 class="section-title">EDUCATION</h3>${itemsHtml}</div>`;
    }

    function generateProjectsHtmlForPdf(projects) {
        if (!projects || projects.length === 0) return '';
        const itemsHtml = projects.map(proj => `
            <div class="item">
                <h4>${proj.projectName || ''} ${proj.projectLink ? `<a href="${proj.projectLink}" target="_blank" style="font-size:0.9em; margin-left:10px; text-decoration:none;">🔗 View Project</a>` : ''}</h4>
                <p>${proj.projectDescription || ''}</p>
            </div>
        `).join('');
        return `<div class="section"><h3 class="section-title">PROJECTS</h3>${itemsHtml}</div>`;
    }

    function generateSkillsHtmlForPdf(skillsString, templateName) {
        const skillsArray = skillsString ? skillsString.split(',').map(s => s.trim()).filter(s => s !== '') : [];
        if (skillsArray.length === 0) return '';
        
        // ATS friendly templates might just want comma-separated text, others tags
        if (templateName === 'ATS-Friendly') { // Use capitalized name as per select option value
            return skillsArray.join(', ');
        }
        return `<div class="skills-grid">${skillsArray.map(skill => `<span class="skill-tag-pdf">${skill}</span>`).join('')}</div>`;
    }

    // --- Real-time Live Preview ---
    async function updatePreview() {
        const data = collectFormData();
        const selectedTemplateKey = data.selectedTemplate;
        let cvHtmlContent = await fetchTemplate(selectedTemplateKey); // Await fetching

        if (!cvHtmlContent) {
            previewArea.innerHTML = `<div class="template-placeholder"><p>Error: Could not load template "${selectedTemplateKey}".</p></div>`;
            return;
        }

        // Replace general placeholders
        cvHtmlContent = cvHtmlContent.replace(/{{name}}/g, data.name || 'YOUR NAME');
        cvHtmlContent = cvHtmlContent.replace(/{{email}}/g, data.email || 'your.email@example.com');
        cvHtmlContent = cvHtmlContent.replace(/{{phone}}/g, data.phone || '+1 (555) 123-4567');
        cvHtmlContent = cvHtmlContent.replace(/{{address}}/g, data.address || 'Your City, Your Country | LinkedIn Profile');
        cvHtmlContent = cvHtmlContent.replace(/{{summary}}/g, data.summary || 'A highly motivated and results-oriented professional with a strong background in [Your Field]. Seeking to leverage skills and experience to contribute to [Company/Organization Name].');
        cvHtmlContent = cvHtmlContent.replace(/{{profilePicture}}/g, data.profilePicture || 'https://placehold.co/128x128/E0E7FF/3366FF?text=128x128');
        cvHtmlContent = cvHtmlContent.replace(/{{certificationsContent}}/g, data.certifications ? `<div class="section"><h3 class="section-title">CERTIFICATIONS</h3><p>${data.certifications}</p></div>` : '');

        // Replace dynamic section placeholders with generated HTML
        cvHtmlContent = cvHtmlContent.replace(/{{experienceContent}}/g, generateExperienceHtmlForPdf(data.experience));
        cvHtmlContent = cvHtmlContent.replace(/{{educationContent}}/g, generateEducationHtmlForPdf(data.education));
        cvHtmlContent = cvHtmlContent.replace(/{{projectsContent}}/g, generateProjectsHtmlForPdf(data.projects));
        cvHtmlContent = cvHtmlContent.replace(/{{skillsContent}}/g, generateSkillsHtmlForPdf(data.skills, selectedTemplateKey)); // Pass template key
        
        // Order ID placeholder will be replaced by backend
        cvHtmlContent = cvHtmlContent.replace(/{{orderId}}/g, 'PREVIEW_ID'); 

        previewArea.innerHTML = cvHtmlContent;
    }

    // --- JSONP Submission Trigger ---
    downloadCvBtn.addEventListener('click', async (event) => {
        event.preventDefault(); // Prevent default button behavior
        
        const formData = collectFormData();
        if (!formData.selectedTemplate) {
            alert('Please select a CV template before generating!');
            return;
        }

        showLoading(); // Show loading spinner

        try {
            const selectedTemplateUrl = `${TEMPLATES_BASE_URL}${formData.selectedTemplate}.html`;
            console.log('Sending template URL to GAS:', selectedTemplateUrl);

            // Dynamically create a script tag for JSONP
            const script = document.createElement('script');
            // IMPORTANT: REPLACE WITH YOUR DEPLOYED GOOGLE APPS SCRIPT WEB APP URL
            const gasWebAppURL = 'https://script.google.com/macros/s/AKfycbzG6hdNwWCaIjh2CjJP_l1Gxr5H38qcfhU3WSnxYK3hUhRGaNvBSc3u8JRGZ4a_vu2iGw/exec'; 
            const callbackName = 'handleGasResponse_' + Date.now(); // Unique callback name for each request

            const params = new URLSearchParams();
            // Append all form data fields
            for (const key in formData) {
                if (formData.hasOwnProperty(key)) {
                    // Stringify arrays for Apps Script to parse
                    if (Array.isArray(formData[key])) {
                        params.append(key, JSON.stringify(formData[key]));
                    } else {
                        params.append(key, formData[key]);
                    }
                }
            }
            params.append('templateUrl', selectedTemplateUrl); // Pass the template URL to Apps Script
            params.append('callback', callbackName);

            script.src = `${gasWebAppURL}?${params.toString()}`;
            script.onerror = (errorEvent) => {
                hideLoading(); // Hide loading on error
                console.error('Script load error (check network/CORS for GAS URL):', errorEvent);
                alert('Network error or invalid Apps Script URL. Check browser console for details.');
                document.body.removeChild(script);
                delete window[callbackName];
            };
            document.body.appendChild(script);

            // Define the JSONP callback function
            window[callbackName] = (response) => {
                console.log('GAS Response:', response);
                hideLoading(); // Hide loading once response is received

                if (response.status === 'success') {
                    // Directly open the PDF URL to trigger download
                    const downloadLink = document.createElement('a');
                    downloadLink.href = response.pdfUrl;
                    downloadLink.download = `${formData.name || 'CValize_User'}_CV.pdf`; // Suggest a filename
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                    alert('CV generated and download initiated!');
                } else {
                    alert('Error generating CV: ' + (response.message || 'Unknown error.'));
                }
                document.body.removeChild(script); // Clean up the script tag
                delete window[callbackName]; // Clean up the global function
            };
        } catch (error) {
            hideLoading(); // Ensure loading is hidden on any JS error
            console.error('Download initiation error:', error);
            alert('An unexpected error occurred during download preparation.');
        }
    });

    // --- Initial setup ---
    // Attach remove listeners to initial dynamic entries
    document.querySelectorAll('.remove-entry-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.dynamic-entry-block').remove();
            updatePreview();
        });
    });

    updatePreview(); // Initial preview render with default template
});