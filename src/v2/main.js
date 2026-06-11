// Internet City V2 — main router
import { loadState, saveState, completeModule, awardCoins } from './shared/state.js';
import { showHome } from './screens/home.js';

const app = document.getElementById('app');
let state = loadState();

function navigate(screen, ...args) {
  app.innerHTML = '';
  if (screen === 'home') {
    showHome(app, state, (moduleId) => navigate('module', moduleId));
  } else if (screen === 'module') {
    const moduleId = args[0];
    loadModule(moduleId);
  }
}

async function loadModule(id) {
  document.body.classList.remove('home-screen');
  const map = {
    1:  () => import('./modules/m1-delivery/index.js'),
    2:  () => import('./modules/m2-waterpark/index.js'),
    3:  () => import('./modules/m3-rockets/index.js'),
    4:  () => import('./modules/m4-monsters/index.js'),
    5:  () => import('./modules/m5-ninja/index.js'),
    6:  () => import('./modules/m6-traffic/index.js'),
    7:  () => import('./modules/m7-maze/index.js'),
    8:  () => import('./modules/m8-babel/index.js'),
    9:  () => import('./modules/m9-memory/index.js'),
    10: () => import('./modules/m10-relay/index.js'),
    11: () => import('./modules/m11-auction/index.js'),
    12: () => import('./modules/m12-timewarp/index.js'),
    13: () => import('./modules/m13-sorting/index.js'),
    14: () => import('./modules/m14-gates/index.js'),
    15: () => import('./modules/m15-bst/index.js'),
  };
  const loader = map[id];
  if (!loader) return navigate('home');
  const mod = await loader();
  mod.launch(app, state, (stars, coinsEarned) => {
    state = completeModule(state, id, stars);
    state = awardCoins(state, coinsEarned);
    navigate('home');
  });
}

navigate('home');
