const ADSENSE_CLIENT_ID = "ca-pub-XXXXXXXXXXXXXXX"; // placeholder
let ADS_ENABLED = false;

const ADSENSE_SLOTS = {
    TOP_LEADERBOARD: "1234567890",
    SIDEBAR_RECT: "2345678901",
    IN_CONTENT: "3456789012"
};

function initAds() {
    if (localStorage.getItem('cookieConsent') === 'true') {
        ADS_ENABLED = true;
    }

    const adSlots = document.querySelectorAll('.ad-slot');

    if (!ADS_ENABLED || ADSENSE_CLIENT_ID.includes('X')) {
        adSlots.forEach(slot => {
            slot.innerHTML = '<span>Ad placeholder</span>';
        });
        return;
    }

    // Load AdSense script
    const script = document.createElement('script');
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;
    script.async = true;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);

    adSlots.forEach(slot => {
        const slotId = slot.getAttribute('data-ad-slot');
        slot.innerHTML = `<ins class="adsbygoogle"
         style="display:block"
         data-ad-client="${ADSENSE_CLIENT_ID}"
         data-ad-slot="${ADSENSE_SLOTS[slotId] || ''}"
         data-ad-format="auto"
         data-full-width-responsive="true"></ins>`;

        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error(e);
        }
    });
}

document.addEventListener('DOMContentLoaded', initAds);
