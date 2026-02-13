 // --- 1. UI ANIMATIONS & NAVIGATION ---
        window.addEventListener('load', () => {
            const loader = document.getElementById('loader');
            if(loader) {
                loader.classList.add('fade-out');
                setTimeout(() => loader.style.display = 'none', 800);
            }
        });

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('active');
            });
        }, { threshold: 0.1 });
        document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

        function toggleAuthModal() {
            const modal = document.getElementById('authModal');
            const content = document.getElementById('modalContent');
            if (modal.classList.contains('hidden')) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
                setTimeout(() => {
                    content.classList.remove('scale-95', 'opacity-0', 'translate-y-8');
                    content.classList.add('scale-100', 'opacity-100', 'translate-y-0');
                }, 50);
            } else {
                content.classList.add('scale-95', 'opacity-0', 'translate-y-8');
                content.classList.remove('scale-100', 'opacity-100', 'translate-y-0');
                setTimeout(() => {
                    modal.classList.add('hidden');
                    modal.classList.remove('flex');
                }, 500);
            }
        }

        function toggleMobileMenu() {
            const menu = document.getElementById('mobile-menu');
            const hamburger = document.querySelector('.hamburger');
            if(menu) {
                menu.classList.toggle('open');
                hamburger.classList.toggle('active');
            }
        }

        // --- 2. BACKEND & UPLOAD LOGIC ---

        // State variables
        let currentPages = 0;
        let isColor = false; // default BW
        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('file-input');
        
        // Drag & Drop Visuals
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                dropZone.classList.add('border-blue-500', 'bg-blue-50');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                dropZone.classList.remove('border-blue-500', 'bg-blue-50');
            }, false);
        });

        // Handle File Drop or Select
        dropZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length) handleFiles(files[0]);
        });

        fileInput.addEventListener('change', (e) => {
            if (fileInput.files.length) handleFiles(fileInput.files[0]);
        });

        function handleFiles(file) {
            // Update UI to Loading State
            document.getElementById('drop-content').classList.add('hidden');
            document.getElementById('success-state').classList.add('hidden');
            document.getElementById('loading-state').classList.remove('hidden');
            document.getElementById('loading-state').classList.add('flex');

            // Send to Backend
            const formData = new FormData();
            formData.append('file', file);

            // Fetch to Localhost Node Server
            fetch('http://localhost:3000/api/upload', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                // Remove Loader
                document.getElementById('loading-state').classList.remove('flex');
                document.getElementById('loading-state').classList.add('hidden');

                if (data.success) {
                    currentPages = data.pageCount;
                    
                    // Show Success UI
                    document.getElementById('success-state').classList.remove('hidden');
                    document.getElementById('success-state').classList.add('flex');
                    document.getElementById('file-name-display').innerText = data.filename;
                    document.getElementById('page-count-display').innerText = `${data.pageCount} Pages Detected`;
                    document.getElementById('total-pages').innerText = data.pageCount;

                    // Trigger Calculation
                    calculateTotal();
                }
            })
            .catch(error => {
                alert('Connection Error: Is the Node.js server running?');
                document.getElementById('loading-state').classList.add('hidden');
                document.getElementById('drop-content').classList.remove('hidden');
                console.error(error);
            });
        }

        // --- 3. PRICING LOGIC ---

        function setMode(mode) {
            const btnBw = document.getElementById('btn-bw');
            const btnColor = document.getElementById('btn-color');
            
            if (mode === 'bw') {
                isColor = false;
                btnBw.className = "py-3 rounded-xl border-2 border-blue-600 bg-blue-50 text-blue-600 font-bold transition";
                btnColor.className = "py-3 rounded-xl border border-slate-100 bg-slate-50 font-bold hover:bg-slate-100 transition";
            } else {
                isColor = true;
                btnColor.className = "py-3 rounded-xl border-2 border-blue-600 bg-blue-50 text-blue-600 font-bold transition";
                btnBw.className = "py-3 rounded-xl border border-slate-100 bg-slate-50 font-bold hover:bg-slate-100 transition";
            }
            calculateTotal();
        }

        function calculateTotal() {
            if (currentPages === 0) return;

            const paperMultiplier = parseFloat(document.getElementById('paper-quality').value);
            let rate = isColor ? 15 : 5; // Pricing Logic: 5rs B&W, 15rs Color

            const subtotal = currentPages * rate * paperMultiplier;
            const delivery = 100; // Fixed delivery
            const total = subtotal + delivery;

            document.getElementById('subtotal').innerText = subtotal.toFixed(2);
            document.getElementById('grand-total').innerText = total.toFixed(2);
}
