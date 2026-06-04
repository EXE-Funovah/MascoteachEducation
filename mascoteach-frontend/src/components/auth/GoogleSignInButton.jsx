import { useEffect, useRef, useState } from 'react';

const GOOGLE_SCRIPT_ID = 'google-identity-services';
const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

function loadGoogleIdentityScript() {
    if (window.google?.accounts?.id) {
        return Promise.resolve();
    }

    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID);
    if (existingScript) {
        return new Promise((resolve, reject) => {
            existingScript.addEventListener('load', resolve, { once: true });
            existingScript.addEventListener('error', reject, { once: true });
        });
    }

    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.id = GOOGLE_SCRIPT_ID;
        script.src = GOOGLE_SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

export default function GoogleSignInButton({
    onCredential,
    disabled = false,
    text = 'continue_with',
}) {
    const buttonRef = useRef(null);
    const [scriptError, setScriptError] = useState('');
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    useEffect(() => {
        let cancelled = false;

        async function setupGoogleButton() {
            if (!clientId || disabled) return;

            try {
                await loadGoogleIdentityScript();
                if (cancelled || !buttonRef.current) return;

                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: (response) => {
                        if (response?.credential) {
                            onCredential(response.credential);
                        }
                    },
                });

                buttonRef.current.innerHTML = '';
                window.google.accounts.id.renderButton(buttonRef.current, {
                    type: 'standard',
                    theme: 'outline',
                    size: 'large',
                    shape: 'rectangular',
                    text,
                    logo_alignment: 'left',
                    width: buttonRef.current.offsetWidth || 360,
                });
            } catch {
                if (!cancelled) {
                    setScriptError('Không thể tải đăng nhập Google. Vui lòng thử lại sau.');
                }
            }
        }

        setupGoogleButton();

        return () => {
            cancelled = true;
        };
    }, [clientId, disabled, onCredential, text]);

    if (!clientId) {
        return (
            <button
                type="button"
                className="auth-provider auth-provider--disabled"
                disabled
                title="Thiếu VITE_GOOGLE_CLIENT_ID"
            >
                Tiếp tục với Google
            </button>
        );
    }

    if (scriptError) {
        return (
            <button type="button" className="auth-provider auth-provider--disabled" disabled>
                {scriptError}
            </button>
        );
    }

    return (
        <div
            ref={buttonRef}
            className="auth-google-button"
            aria-busy={disabled ? 'true' : 'false'}
        />
    );
}
