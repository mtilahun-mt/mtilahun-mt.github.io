/* ============================================================
   introduction.js  —  ITIS 3135 Introduction Form
   Handles: form validation, clear, reset, dynamic course rows,
   image preview, and rendering the submitted intro page.
   ============================================================ */

(function () {
    "use strict";

    /* ── DOM references ───────────────────────────────────────── */
    var form         = document.getElementById("intro-form");
    var formWrap     = document.getElementById("form-container");
    var outputWrap   = document.getElementById("output-container");
    var imgPreview   = document.getElementById("img-preview");
    var pictureInput = document.getElementById("picture-input");
    var addCourseBtn = document.getElementById("add-course-btn");
    var courseList   = document.getElementById("course-list");

    /* Current image source — updated when user uploads a file */
    var currentImgSrc = imgPreview ? imgPreview.src : "";

    /* ================================================================
       FUNCTION DEFINITIONS
       ================================================================ */

    /* ── HTML escape helper ───────────────────────────────────── */
    function escHtml(str) {
        return String(str)
            .replace(/&/g,  "&amp;")
            .replace(/</g,  "&lt;")
            .replace(/>/g,  "&gt;")
            .replace(/"/g,  "&quot;");
    }

    /* ── Field value shortcut ─────────────────────────────────── */
    function val(id) {
        var el = document.getElementById(id);
        return el ? el.value.trim() : "";
    }

    /* ── Clear all inline validation errors ──────────────────── */
    function clearErrors() {
        var errFields = form.querySelectorAll(".field-error");
        var errMsgs   = form.querySelectorAll(".error-msg");
        Array.from(errFields).forEach(function (el) { el.classList.remove("field-error"); });
        Array.from(errMsgs).forEach(function (el) { el.remove(); });
    }

    /* ── Show an error on a single field ─────────────────────── */
    function showError(field, msg) {
        field.classList.add("field-error");
        var span = document.createElement("span");
        span.className   = "error-msg";
        span.textContent = msg;
        field.insertAdjacentElement("afterend", span);
    }

    /* ── Show an error beneath a whole section ───────────────── */
    function showSectionError(section, msg) {
        var span = document.createElement("span");
        span.className   = "error-msg";
        span.textContent = msg;
        section.appendChild(span);
    }

    /* ── Validate required fields ─────────────────────────────── */
    function validateForm() {
        clearErrors();
        var valid    = true;
        var required = Array.from(form.querySelectorAll("[required]"));

        required.forEach(function (field) {
            if (!field.value.trim()) {
                showError(field, "This field is required.");
                valid = false;
            }
        });

        if (courseList.querySelectorAll(".course-row").length === 0) {
            showSectionError(document.getElementById("courses-section"),
                             "Please add at least one course.");
            valid = false;
        }

        return valid;
    }

    /* ── Renumber course rows after a deletion ────────────────── */
    function renumberCourses() {
        Array.from(courseList.children).forEach(function (row, i) {
            row.querySelector(".course-num").textContent = "Course " + (i + 1);
        });
    }

    /* ── Attach delete listener to a course row ──────────────── */
    function attachDeleteListener(row) {
        row.querySelector(".delete-course-btn").addEventListener("click", function () {
            row.remove();
            renumberCourses();
        });
    }

    /* ── Add a new dynamic course row ────────────────────────── */
    function addCourse() {
        var idx = courseList.children.length + 1;
        var row = document.createElement("div");
        row.className = "course-row";
        row.setAttribute("data-course-index", idx);

        row.innerHTML =
            "<span class='course-num'>Course " + idx + "</span>" +
            "<input type='text' class='course-dept'   placeholder='Dept (e.g. ITIS)'   aria-label='Department for course " + idx + "'>" +
            "<input type='text' class='course-number' placeholder='Number (e.g. 3135)' aria-label='Number for course " + idx + "'>" +
            "<input type='text' class='course-name'   placeholder='Course name'        aria-label='Name for course " + idx + "'>" +
            "<input type='text' class='course-reason' placeholder='Reason for taking'  aria-label='Reason for course " + idx + "'>" +
            "<button type='button' class='delete-course-btn' aria-label='Remove course " + idx + "'>\u2715 Remove</button>";

        attachDeleteListener(row);
        courseList.appendChild(row);
    }

    /* ── Collect course data from all rows ────────────────────── */
    function getCourses() {
        return Array.from(courseList.querySelectorAll(".course-row")).map(function (row) {
            return {
                dept:   row.querySelector(".course-dept")   ? row.querySelector(".course-dept").value.trim()   : "",
                number: row.querySelector(".course-number") ? row.querySelector(".course-number").value.trim() : "",
                name:   row.querySelector(".course-name")   ? row.querySelector(".course-name").value.trim()   : "",
                reason: row.querySelector(".course-reason") ? row.querySelector(".course-reason").value.trim() : ""
            };
        });
    }

    /* ── Clear all fields (empty values, restore default image) ─ */
    function clearForm() {
        var fields = form.querySelectorAll(
            "input:not([type='file']):not([type='radio']):not([type='checkbox']), textarea, select"
        );
        Array.from(fields).forEach(function (el) { el.value = ""; });

        if (imgPreview) {
            imgPreview.src = imgPreview.dataset.default || "";
            currentImgSrc  = imgPreview.src;
        }
        clearErrors();
    }

    /* ── Full reset — restores default pre-filled values ─────── */
    function resetAll() {
        form.reset();

        if (imgPreview) {
            imgPreview.src = imgPreview.dataset.default || "";
            currentImgSrc  = imgPreview.src;
        }

        clearErrors();
        outputWrap.style.display = "none";
        outputWrap.innerHTML     = "";
        formWrap.style.display   = "block";
        formWrap.scrollIntoView({ behavior: "smooth" });
    }

    /* ── Render the introduction output in place of the form ──── */
    function renderOutput() {
        var firstName  = val("first-name");
        var middleName = val("middle-name");
        var nickname   = val("nickname");
        var lastName   = val("last-name");
        var ackStmt    = val("ack-statement");
        var ackDate    = val("ack-date");
        var adjective  = val("mascot-adjective");
        var animal     = val("mascot-animal");
        var divider    = val("divider") || "~";
        var caption    = val("pic-caption");
        var statement  = val("personal-statement");
        var quote      = val("quote");
        var quoteAuth  = val("quote-author");
        var funny      = val("funny");
        var share      = val("share");

        var bulletDefs = [
            { label: "Personal Background",                id: "bullet-personal"     },
            { label: "Professional Background",            id: "bullet-professional" },
            { label: "Academic Background",                id: "bullet-academic"     },
            { label: "Background in this Subject",         id: "bullet-subject"      },
            { label: "Primary Work Computer",              id: "bullet-computer"     },
            { label: "Backup Computer &amp; Location Plan", id: "bullet-backup"      },
            { label: "Other",                              id: "bullet-other"        }
        ];

        var bullets = bulletDefs.filter(function (b) { return val(b.id); });
        var courses  = getCourses();
        var links    = [1, 2, 3, 4, 5].map(function (n) {
            return { label: val("link-label-" + n), url: val("link-url-" + n) };
        }).filter(function (l) { return l.url; });

        /* Full name */
        var fullName    = [firstName, middleName, lastName].filter(Boolean).join(" ");
        var displayNick = nickname ? " (" + nickname + ")" : "";

        /* Bullet list HTML */
        var bulletHTML = bullets.map(function (b) {
            return "<li><strong>" + b.label + ":</strong> " + escHtml(val(b.id)) + "</li>";
        }).join("\n");

        /* Course sub-list HTML */
        var courseHTML = courses.map(function (c) {
            var code   = [c.dept, c.number].filter(Boolean).join(" ");
            var name   = c.name   ? " &ndash; " + escHtml(c.name)   : "";
            var reason = c.reason ? ": "        + escHtml(c.reason) : "";
            return "<li>" + escHtml(code) + name + reason + "</li>";
        }).join("\n");

        /* Links HTML */
        var linkHTML = links.map(function (l) {
            var href = l.url.indexOf("http") === 0 ? l.url : "https://" + l.url;
            return "<li><a href='" + href + "' target='_blank' rel='noopener'>" +
                   escHtml(l.label || l.url) + "</a></li>";
        }).join("\n");

        /* Acknowledgement block */
        var ackHTML = ackStmt
            ? "<p class='out-ack'><em>" + escHtml(ackStmt) + "</em>" +
              (ackDate ? " &mdash; " + escHtml(ackDate) : "") + "</p>"
            : "";

        /* Courses block (only if there are courses) */
        var coursesLI = courseHTML
            ? "<li><strong>Courses I&rsquo;m Taking &amp; Why:</strong><ul>" + courseHTML + "</ul></li>"
            : "";

        /* Optional extras */
        var funnyLI = funny ? "<li><strong>Funny / Interesting:</strong> " + escHtml(funny) + "</li>" : "";
        var shareLI = share ? "<li><strong>I&rsquo;d Also Like to Share:</strong> " + escHtml(share) + "</li>" : "";

        /* Quote block */
        var quoteHTML = quote
            ? "<blockquote class='out-quote'>&ldquo;" + escHtml(quote) +
              "&rdquo;<cite> &mdash; " + escHtml(quoteAuth) + "</cite></blockquote>"
            : "";

        /* Links section */
        var linksHTML = links.length
            ? "<h3>Links</h3><ul class='out-links'>" + linkHTML + "</ul>"
            : "";

        outputWrap.innerHTML =
            "<h2>" + escHtml(adjective) + " " + escHtml(animal) + " " + escHtml(divider) + " ITIS 3135</h2>" +
            ackHTML +
            "<section class='out-intro'>" +
              "<figure>" +
                "<img src='" + currentImgSrc + "' alt='Photo of " + escHtml(firstName) + "'" +
                " style='max-width:220px;border-radius:6px;'>" +
                "<figcaption>" + escHtml(caption) + "</figcaption>" +
              "</figure>" +
              "<div>" +
                "<h3>" + escHtml(fullName) + displayNick + "</h3>" +
                "<p>" + escHtml(statement) + "</p>" +
              "</div>" +
            "</section>" +
            "<ul class='out-bullets'>" +
              bulletHTML + coursesLI + funnyLI + shareLI +
            "</ul>" +
            quoteHTML +
            linksHTML +
            "<p style='margin-top:2rem;'>" +
              "<a href='#' id='reset-link' class='reset-link'>&#8635; Start over</a>" +
            "</p>";

        formWrap.style.display   = "none";
        outputWrap.style.display = "block";
        outputWrap.scrollIntoView({ behavior: "smooth" });

        document.getElementById("reset-link").addEventListener("click", function (e) {
            e.preventDefault();
            resetAll();
        });
    }

    /* ================================================================
       INITIALIZATION — event listeners wired after all defs above
       ================================================================ */

    /* Prevent default submit, validate, then render */
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (validateForm()) {
            renderOutput();
        }
    });

    /* Reset button */
    form.querySelector("button[type='reset']").addEventListener("click", function (e) {
        e.preventDefault();
        resetAll();
    });

    /* Clear button */
    document.querySelector(".clear-btn").addEventListener("click", clearForm);

    /* Image file preview */
    if (pictureInput) {
        pictureInput.addEventListener("change", function () {
            var file = this.files[0];
            if (!file) { return; }
            var reader = new FileReader();
            reader.onload = function (e) {
                imgPreview.src = e.target.result;
                currentImgSrc  = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    /* Add course button */
    if (addCourseBtn) {
        addCourseBtn.addEventListener("click", addCourse);
    }

    /* Attach delete listeners to the pre-filled static course rows */
    Array.from(document.querySelectorAll(".course-row")).forEach(function (row) {
        attachDeleteListener(row);
    });

}());
