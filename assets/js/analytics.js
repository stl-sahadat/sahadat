/**
 * Real Visitor & Engagement Tracker for Md Sahadat Hossain's Portfolio
 * Strictly records REAL interactions into localStorage (Zero dummy data).
 */
(function (window) {
  'use strict';

  const STORAGE_KEY = 'sahadat_portfolio_analytics';
  const SESSION_KEY = 'sahadat_session_id';

  function getCleanDefaultData() {
    return {
      totalVisits: 0,
      totalDurationSeconds: 0,
      githubClicks: 0,
      whatsappClicks: 0,
      linkedinClicks: 0,
      emailCopies: 0,
      emailClicks: 0,
      cvDownloads: 0,
      projectClicks: 0,
      sectionViews: {
        home: 0,
        about: 0,
        skills: 0,
        projects: 0,
        showcase: 0,
        experience: 0,
        contact: 0,
      },
      sessions: [],
    };
  }

  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return getCleanDefaultData();
      const parsed = JSON.parse(raw);
      return Object.assign(getCleanDefaultData(), parsed);
    } catch (e) {
      console.warn('Analytics storage read warning:', e);
      return getCleanDefaultData();
    }
  }

  function saveData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Analytics storage save warning:', e);
    }
  }

  const PortfolioAnalytics = {
    getData: loadData,

    resetData: function () {
      const clean = getCleanDefaultData();
      saveData(clean);
      return clean;
    },

    getCurrentSessionId: function () {
      return sessionStorage.getItem(SESSION_KEY);
    },

    trackEvent: function (eventType, details) {
      const data = loadData();
      const currentSessionId = sessionStorage.getItem(SESSION_KEY);
      const currentSession = data.sessions.find((s) => s.id === currentSessionId);

      switch (eventType) {
        case 'github_click':
          data.githubClicks = (data.githubClicks || 0) + 1;
          if (currentSession) currentSession.githubClicked = true;
          break;
        case 'whatsapp_click':
          data.whatsappClicks = (data.whatsappClicks || 0) + 1;
          if (currentSession) currentSession.whatsappClicked = true;
          break;
        case 'linkedin_click':
          data.linkedinClicks = (data.linkedinClicks || 0) + 1;
          if (currentSession) currentSession.linkedinClicked = true;
          break;
        case 'email_copy':
          data.emailCopies = (data.emailCopies || 0) + 1;
          if (currentSession) currentSession.emailCopied = true;
          break;
        case 'email_click':
          data.emailClicks = (data.emailClicks || 0) + 1;
          break;
        case 'cv_download':
          data.cvDownloads = (data.cvDownloads || 0) + 1;
          break;
        case 'project_click':
          data.projectClicks = (data.projectClicks || 0) + 1;
          break;
      }

      saveData(data);
    },

    trackSection: function (sectionName) {
      if (!sectionName) return;
      const data = loadData();
      if (!data.sectionViews) data.sectionViews = {};
      data.sectionViews[sectionName] = (data.sectionViews[sectionName] || 0) + 1;

      const currentSessionId = sessionStorage.getItem(SESSION_KEY);
      const currentSession = data.sessions.find((s) => s.id === currentSessionId);
      if (currentSession) {
        if (!Array.isArray(currentSession.sectionsVisited)) {
          currentSession.sectionsVisited = [];
        }
        if (!currentSession.sectionsVisited.includes(sectionName)) {
          currentSession.sectionsVisited.push(sectionName);
        }
      }

      saveData(data);
    },

    formatDuration: function (totalSeconds) {
      totalSeconds = Math.max(0, Math.floor(totalSeconds || 0));
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
      }
      if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
      }
      return `${seconds}s`;
    },

    init: function () {
      // Do not count visits if inside /admin
      if (window.location.pathname.startsWith('/admin')) {
        return;
      }

      const data = loadData();
      let sessionId = sessionStorage.getItem(SESSION_KEY);

      if (!sessionId) {
        // New visitor session
        sessionId = 'sess_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        sessionStorage.setItem(SESSION_KEY, sessionId);

        data.totalVisits = (data.totalVisits || 0) + 1;

        const now = new Date();
        const dateStr = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const deviceType = window.innerWidth < 768 ? 'Mobile' : window.innerWidth < 1024 ? 'Tablet' : 'Desktop';
        const screenRes = `${window.innerWidth}x${window.innerHeight}`;

        const newSession = {
          id: sessionId,
          date: dateStr,
          timestamp: now.getTime(),
          durationSeconds: 0,
          githubClicked: false,
          whatsappClicked: false,
          linkedinClicked: false,
          emailCopied: false,
          sectionsVisited: ['home'],
          device: `${deviceType} (${screenRes})`,
        };

        data.sessions.unshift(newSession);
        // Keep at most 50 sessions
        if (data.sessions.length > 50) {
          data.sessions = data.sessions.slice(0, 50);
        }

        saveData(data);
      }

      // Real active duration tracking timer with buffered storage flush
      let unflushedSeconds = 0;

      function flushDuration() {
        if (unflushedSeconds > 0) {
          const liveData = loadData();
          liveData.totalDurationSeconds = (liveData.totalDurationSeconds || 0) + unflushedSeconds;
          const current = liveData.sessions.find((s) => s.id === sessionId);
          if (current) {
            current.durationSeconds = (current.durationSeconds || 0) + unflushedSeconds;
          }
          saveData(liveData);
          unflushedSeconds = 0;
        }
      }

      let activeTicker = setInterval(() => {
        if (!document.hidden) {
          unflushedSeconds++;
          // Flush every 3 seconds to keep admin console live while avoiding I/O overhead
          if (unflushedSeconds >= 3) {
            flushDuration();
          }
        }
      }, 1000);

      // Reliable flushing on tab close, hide, or mobile app switch
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          flushDuration();
        }
      });
      window.addEventListener('pagehide', flushDuration);
      window.addEventListener('beforeunload', () => {
        flushDuration();
        clearInterval(activeTicker);
      });

      // Bind automated event delegation for tracking clicks
      document.addEventListener('click', function (e) {
        const target = e.target.closest('a, button');
        if (!target) return;

        const href = target.getAttribute('href') || '';
        const id = target.id || '';

        // GitHub clicks
        if (href.includes('github.com')) {
          PortfolioAnalytics.trackEvent('github_click');
        }
        // WhatsApp clicks
        if (href.includes('wa.me') || href.includes('whatsapp.com')) {
          PortfolioAnalytics.trackEvent('whatsapp_click');
        }
        // LinkedIn clicks
        if (href.includes('linkedin.com')) {
          PortfolioAnalytics.trackEvent('linkedin_click');
        }
        // Direct email clicks
        if (href.startsWith('mailto:')) {
          PortfolioAnalytics.trackEvent('email_click');
        }
        // CV download button
        if (href.includes('.pdf') || target.classList.contains('home__cv')) {
          PortfolioAnalytics.trackEvent('cv_download');
        }
        // Email copy button
        if (id === 'contact-btn' || target.classList.contains('contact__button')) {
          PortfolioAnalytics.trackEvent('email_copy');
        }
        // Project card links
        if (target.classList.contains('projects__button') || target.closest('.projects__card')) {
          PortfolioAnalytics.trackEvent('project_click');
        }
      });
    },
  };

  window.PortfolioAnalytics = PortfolioAnalytics;

  // Auto-run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PortfolioAnalytics.init());
  } else {
    PortfolioAnalytics.init();
  }
})(window);
