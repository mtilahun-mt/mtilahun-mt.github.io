/* ============================================================
   Ankise Miheret Bata Lemariam — church.js
   Handles: nav active state, countdown timer, scroll-animated
   cards, accordion, jQuery UI tooltips, gallery filters &
   lightbox, and contact form validation.
   ============================================================ */

$(function () {

    /* ------------------------------------------------------------------ */
    /* 1. Mark active nav link based on current page filename              */
    /* ------------------------------------------------------------------ */
    var currentPage = location.pathname.split('/').pop() || 'index.html';
    $('nav.church-nav a').each(function () {
        if ($(this).attr('href') === currentPage) {
            $(this).addClass('active');
        }
    });


    /* ------------------------------------------------------------------ */
    /* 2. Holiday Countdown Timer (index.html)                             */
    /* ------------------------------------------------------------------ */
    if ($('#countdown-holder').length) {

        var holidays = [
            { name: 'Fasika — Ethiopian Easter (ፋሲካ)',       date: new Date('2026-04-26T00:00:00') },
            { name: 'Lideta — Birth of the Virgin Mary (ልደታ)', date: new Date('2026-08-30T00:00:00') },
            { name: 'Enkutatash — Ethiopian New Year (እንቁጣጣሽ)', date: new Date('2026-09-11T00:00:00') },
            { name: 'Meskel — Finding of the True Cross (መስቀል)', date: new Date('2026-09-27T00:00:00') },
            { name: 'Gena — Ethiopian Christmas (ገና)',         date: new Date('2027-01-07T00:00:00') },
            { name: 'Timkat — Ethiopian Epiphany (ጥምቀት)',     date: new Date('2027-01-19T00:00:00') }
        ];

        function getNextHoliday() {
            var now = new Date();
            var upcoming = holidays.filter(function (h) { return h.date > now; });
            if (!upcoming.length) { return null; }
            upcoming.sort(function (a, b) { return a.date - b.date; });
            return upcoming[0];
        }

        function updateCountdown() {
            var next = getNextHoliday();
            if (!next) {
                $('#countdown-holder').text('No upcoming holidays found.');
                return;
            }

            var diff = next.date - new Date();
            if (diff <= 0) { updateCountdown(); return; }

            var days    = Math.floor(diff / 86400000);
            var hours   = Math.floor((diff % 86400000) / 3600000);
            var minutes = Math.floor((diff % 3600000) / 60000);
            var seconds = Math.floor((diff % 60000) / 1000);

            $('#countdown-holiday-name').text(next.name);
            $('#cd-days').text(String(days).padStart(2, '0'));
            $('#cd-hours').text(String(hours).padStart(2, '0'));
            $('#cd-minutes').text(String(minutes).padStart(2, '0'));
            $('#cd-seconds').text(String(seconds).padStart(2, '0'));
        }

        updateCountdown();
        setInterval(updateCountdown, 1000);
    }


    /* ------------------------------------------------------------------ */
    /* 3. Scroll-Animated Cards via Intersection Observer                  */
    /* ------------------------------------------------------------------ */
    if ('IntersectionObserver' in window) {
        var cardObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    cardObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.10 });

        document.querySelectorAll('.card').forEach(function (card) {
            cardObserver.observe(card);
        });
    } else {
        /* Fallback: show all cards immediately for older browsers */
        document.querySelectorAll('.card').forEach(function (card) {
            card.classList.add('visible');
        });
    }


    /* ------------------------------------------------------------------ */
    /* 4. Accordion (services.html)                                        */
    /* ------------------------------------------------------------------ */
    $('.accordion-header').on('click', function () {
        var $header = $(this);
        var $body   = $header.next('.accordion-body');
        var isOpen  = $header.hasClass('open');

        /* Close all open panels */
        $('.accordion-header').removeClass('open').attr('aria-expanded', 'false');
        $('.accordion-body').slideUp(260);

        /* Open the clicked panel if it was previously closed */
        if (!isOpen) {
            $header.addClass('open').attr('aria-expanded', 'true');
            $body.slideDown(260);
        }
    });


    /* ------------------------------------------------------------------ */
    /* 5. jQuery UI Tooltips on service schedule rows (services.html)     */
    /* ------------------------------------------------------------------ */
    if ($.fn.tooltip) {
        $('.schedule-table tbody tr[title]').tooltip({
            position: { my: 'left+12 center', at: 'right center' },
            tooltipClass: 'church-tooltip'
        });
    }


    /* ------------------------------------------------------------------ */
    /* 6. Gallery: Category Filters & Lightbox (gallery.html)             */
    /* ------------------------------------------------------------------ */
    if ($('.gallery-grid').length) {

        /* --- Filter buttons --- */
        $('.filter-btn').on('click', function () {
            var cat = $(this).data('filter');
            $('.filter-btn').removeClass('active');
            $(this).addClass('active');

            if (cat === 'all') {
                $('.gallery-item').fadeIn(300);
            } else {
                $('.gallery-item').each(function () {
                    if ($(this).data('category') === cat) {
                        $(this).fadeIn(300);
                    } else {
                        $(this).fadeOut(220);
                    }
                });
            }
        });

        /* --- Lightbox open --- */
        $(document).on('click', '.gallery-item', function () {
            var src     = $(this).find('img').attr('src');
            var alt     = $(this).find('img').attr('alt');
            var caption = $(this).find('.gallery-caption').text().trim();

            $('#lightbox-img').attr({ src: src, alt: alt });
            $('#lightbox-caption').text(caption);
            $('#lightbox').addClass('open');
            $('body').css('overflow', 'hidden');
        });

        /* --- Lightbox close: ×-button or click outside image --- */
        $('#lightbox-close').on('click', function () {
            $('#lightbox').removeClass('open');
            $('body').css('overflow', '');
        });

        $('#lightbox').on('click', function (e) {
            if (e.target === this) {
                $(this).removeClass('open');
                $('body').css('overflow', '');
            }
        });

        /* --- Lightbox close: Escape key --- */
        $(document).on('keydown', function (e) {
            if (e.key === 'Escape' && $('#lightbox').hasClass('open')) {
                $('#lightbox').removeClass('open');
                $('body').css('overflow', '');
            }
        });
    }


    /* ------------------------------------------------------------------ */
    /* 7. Contact Form Validation (contact.html)                           */
    /* ------------------------------------------------------------------ */
    if ($('#contact-form').length) {

        function validate($group, $field, testFn, errorMsg) {
            if (!testFn($field.val())) {
                $group.addClass('has-error');
                $group.find('.form-error').text(errorMsg);
                return false;
            }
            $group.removeClass('has-error');
            return true;
        }

        $('#contact-form').on('submit', function (e) {
            e.preventDefault();
            var ok = true;

            ok = validate(
                $('#group-name'), $('#input-name'),
                function (v) { return v.trim().length > 0; },
                'Name is required.'
            ) && ok;

            ok = validate(
                $('#group-email'), $('#input-email'),
                function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); },
                'A valid email address is required.'
            ) && ok;

            ok = validate(
                $('#group-subject'), $('#input-subject'),
                function (v) { return v !== ''; },
                'Please select a subject.'
            ) && ok;

            ok = validate(
                $('#group-message'), $('#input-message'),
                function (v) { return v.trim().length >= 10; },
                'Message must be at least 10 characters.'
            ) && ok;

            if (ok) {
                $('#contact-form').fadeOut(300, function () {
                    $('#form-success').fadeIn(400);
                });
            }
        });

        /* Clear error state as soon as the user starts correcting a field */
        $('#contact-form').on('input change', 'input, select, textarea', function () {
            $(this).closest('.form-group').removeClass('has-error');
        });
    }

});
