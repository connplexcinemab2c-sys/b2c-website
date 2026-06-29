import { legacy_createStore as createStore, applyMiddleware, compose } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import localStorage from 'redux-persist/es/storage';
import thunk from 'redux-thunk';
import rootReducer from './rootReducer';

// Redux Persist configuration
const persistConfig = {
  key: 'root',
  storage: localStorage,
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Check if Redux DevTools extension is available
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// Create and configure the store with middleware and DevTools
export default () => {
  let store = createStore(
    persistedReducer,
    composeEnhancers(applyMiddleware(thunk)) // Apply middleware and enable Redux DevTools
  );
  let persistor = persistStore(store);
  return { store, persistor };
};
