/**
 * Smooth Multi-String Typewriter Effect - LayerByte Edition
 * Cycles through titles with realistic character typing,
 * pause duration, and smooth backspacing.
 */

class Typewriter {
  constructor(element, strings, options = {}) {
    this.element = element;
    this.strings = strings || [];
    this.loop = options.loop !== undefined ? options.loop : true;
    this.typingSpeed = options.typingSpeed || 90;
    this.deletingSpeed = options.deletingSpeed || 45;
    this.pauseDuration = options.pauseDuration || 1800;
    
    this.stringIndex = 0;
    this.charIndex = 0;
    this.isDeleting = false;
    this.timer = null;

    if (this.element && this.strings.length > 0) {
      this.tick();
    }
  }

  tick() {
    const currentString = this.strings[this.stringIndex];
    
    if (this.isDeleting) {
      this.charIndex--;
      this.element.textContent = currentString.substring(0, this.charIndex);
    } else {
      this.charIndex++;
      this.element.textContent = currentString.substring(0, this.charIndex);
    }

    let delay = this.isDeleting ? this.deletingSpeed : this.typingSpeed;

    if (!this.isDeleting && this.charIndex === currentString.length) {
      delay = this.pauseDuration;
      this.isDeleting = true;
    } else if (this.isDeleting && this.charIndex === 0) {
      this.isDeleting = false;
      this.stringIndex = (this.stringIndex + 1) % this.strings.length;
      delay = 400;
    }

    this.timer = setTimeout(() => this.tick(), delay);
  }

  destroy() {
    if (this.timer) clearTimeout(this.timer);
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const target = document.getElementById('typewriter-text');
  if (target) {
    new Typewriter(target, [
      'Python & C++ Developer',
      'C# & .NET Engineer',
      'Golang Systems Specialist',
      'JavaScript, PHP & Lua Coder',
      'Open Source & Security Creator'
    ], {
      typingSpeed: 85,
      deletingSpeed: 40,
      pauseDuration: 1900
    });
  }
});
