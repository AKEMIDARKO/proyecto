"use client";
import { createContext, useContext, type ReactNode } from 'react';
import { kiokus, type Kioku } from '@/lib/kioku-catalog';
const CatalogContext=createContext<readonly Kioku[]>(kiokus);
export const useKiokus=()=>useContext(CatalogContext);
export function KiokuProvider({units,children}:{units:readonly Kioku[];children:ReactNode}){return <CatalogContext.Provider value={units}>{children}</CatalogContext.Provider>;}
