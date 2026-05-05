// Vision Capture - Turn ideas into reality
class VisionCapture {
    constructor() {
        this.visions = JSON.parse(localStorage.getItem('visions') || '[]');
        this.addFloatingButton();
    }
    addFloatingButton() {
        let btn = document.createElement('div');
        btn.innerHTML = '✨';
        btn.style.cssText = 'position:fixed;bottom:100px;right:20px;width:48px;height:48px;background:#ff69b4;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;cursor:pointer;z-index:10000;';
        btn.onclick = () => this.capture();
        document.body.appendChild(btn);
    }
    capture() {
        let idea = prompt('✨ What is your vision?');
        if(idea) {
            this.visions.unshift({ id: Date.now(), description: idea, timestamp: new Date().toISOString() });
            localStorage.setItem('visions', JSON.stringify(this.visions));
            alert('Vision captured! Check the Vision Board.');
        }
    }
    getVisions() { return this.visions; }
}
window.visionCapture = new VisionCapture();