import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.html',
  styleUrls: ['./landing.css'],
  standalone: true,
  imports: [CommonModule]
})
export class LandingComponent {
  imageLoaded = false;
  isMenuOpen = false;

  constructor(private router: Router) {}

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  scrollToSection(sectionId: string) {
    this.isMenuOpen = false;
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  onLogin() {
    console.log('Login clicked');
    this.router.navigate(['/auth/login']);
  }

  onTryFree() {
    console.log('Start Free Trial clicked');
    this.router.navigate(['/auth/login']);
  }

  onWatchDemo() {
    console.log('Watch Demo clicked');
    // You can open a modal or navigate to demo page
    alert('Demo video coming soon!');
  }

  onGetStarted() {
    console.log('Get Started clicked');
    this.router.navigate(['/auth/login']);
  }

  onTryNow() {
    console.log('Try Now clicked');
    this.router.navigate(['/auth/login']);
  }

  onLearnMore() {
    console.log('Learn More clicked');
    this.scrollToSection('features');
  }

  onDownloadApp(platform: string) {
    console.log(`Download app for ${platform}`);
    alert(`Download TaskTracker from ${platform === 'ios' ? 'App Store' : 'Google Play'} coming soon!`);
  }

  onContactUs() {
    console.log('Contact Us clicked');
    this.scrollToSection('contact');
  }

  onNavigate(section: string) {
    console.log(`Navigate to ${section}`);
    switch(section) {
      case 'features':
        this.scrollToSection('features');
        break;
      case 'pricing':
        this.scrollToSection('pricing');
        break;
      case 'demo':
        alert('Demo coming soon!');
        break;
      default:
        // Handle other navigation
        break;
    }
  }
}