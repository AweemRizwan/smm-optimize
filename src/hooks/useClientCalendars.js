// src/hooks/useClientCalendars.ts
import { skipToken } from '@reduxjs/toolkit/query/react';
import {
    useGetClientCalendarsQuery as useOriginalGetClientCalendarsQuery,
} from '../services/clientApi';

export function useClientCalendars(clientId) {
    // if no clientId, pass skipToken → query is never fired
    const effectiveArg = clientId ?? skipToken;
    // you can also default data right here:
    const { data, ...rest } = useOriginalGetClientCalendarsQuery(effectiveArg);
    return {
        data: data ?? [],
        ...rest,
    };
}
