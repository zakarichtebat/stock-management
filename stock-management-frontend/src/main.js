import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import '@fortawesome/fontawesome-free/css/all.css';

// Bootstrap

import 'bootstrap';

// Styles
import './assets/styles/main.css';

// Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faChartLine,
  faBox,
  faBoxes,
  faFileInvoice,
  faFileInvoiceDollar,
  faChartBar,
  faBell,
  faUser,
  faCog,
  faSignOutAlt,
  faSync,
  faCheckCircle,
  faExclamationTriangle,
  faInfoCircle,
  faTimesCircle,
  faTimes,
  faPlus,
  faPlusCircle,
  faEye,
  faArrowRight,
  faArrowUp,
  faArrowDown,
  faEquals,
  faBolt,
  faHistory,
  faCubes,
  faTag,
  faChevronDown,
  faSearch,
  faTags,
  faTruck,
  faEuroSign,
  faToggleOn,
  faEraser,
  faFilter,
  faThLarge,
  faList,
  faBoxOpen,
  faEdit,
  faTrash,
  faClock,
  faExclamationCircle,
  faSyncAlt,
  faFile,
  faFilePdf,
  faDownload,
  faCalendar,
  faCalculator,
  faSave,
  faSpinner,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';

// Ajout des icônes à la bibliothèque
library.add(
  faChartLine,
  faBox,
  faBoxes,
  faFileInvoice,
  faFileInvoiceDollar,
  faChartBar,
  faBell,
  faUser,
  faCog,
  faSignOutAlt,
  faSync,
  faCheckCircle,
  faExclamationTriangle,
  faInfoCircle,
  faTimesCircle,
  faTimes,
  faPlus,
  faPlusCircle,
  faEye,
  faArrowRight,
  faArrowUp,
  faArrowDown,
  faEquals,
  faBolt,
  faHistory,
  faCubes,
  faTag,
  faChevronDown,
  faSearch,
  faTags,
  faTruck,
  faEuroSign,
  faToggleOn,
  faEraser,
  faFilter,
  faThLarge,
  faList,
  faBoxOpen,
  faEdit,
  faTrash,
  faClock,
  faExclamationCircle,
  faSyncAlt,
  faFile,
  faFilePdf,
  faDownload,
  faCalendar,
  faCalculator,
  faSave,
  faSpinner,
  faArrowLeft
);

const app = createApp(App);

// Pinia pour la gestion d'état
app.use(createPinia());

// Vue Router pour la navigation
app.use(router);

// Composants globaux
app.component('font-awesome-icon', FontAwesomeIcon);

// Montage de l'application
app.mount('#app');
