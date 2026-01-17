import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { AppComponent } from './app/app';
import { routes } from './app/app.routes';

// Disable browser scroll restoration
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// Force scroll on page load
window.addEventListener('load', () => {
  window.scrollTo(0, 0);
});

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'disabled', // IMPORTANT: disabled
        anchorScrolling: 'disabled'
      }),
      withViewTransitions()
    )
  ]
}).catch(err => console.error(err));