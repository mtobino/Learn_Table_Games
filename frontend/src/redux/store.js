import {configureStore, combineReducers} from '@reduxjs/toolkit'
import {
    persistReducer,
    PERSIST,
    PURGE,
    REGISTER,
    PAUSE,
    FLUSH,
    REHYDRATE
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import autoMergeLevel2 from "redux-persist/es/stateReconciler/autoMergeLevel2";
import { blackjack } from './reducers'

const reducers = {
    blackjack,
};

const persistConfig = {
    key: 'root',
    storage,
    stateReconciler: autoMergeLevel2,
};

const rootReducer = combineReducers(reducers);
const persistedReducer = persistReducer(persistConfig, rootReducer);
export const configStore = () => configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
    devTools: process.env.NODE_ENV !== 'production'  // composeWithDevTools(applyMiddleware(thunk)),
});