var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { CondOperator, RequestQueryBuilder } from '@nestjsx/crud-request';
import omitBy from 'lodash.omitby';
import { fetchUtils } from 'ra-core';
import { stringify } from 'query-string';
/**
 * Maps react-admin queries to a nestjsx/crud powered REST API
 *
 * @see https://github.com/nestjsx/crud
 *
 * @example
 *
 * import React from 'react';
 * import { Admin, Resource } from 'react-admin';
 * import crudProvider from 'ra-data-nestjsx-crud';
 *
 * import { PostList } from './posts';
 *
 * const dataProvider = crudProvider('http://localhost:3000');
 * const App = () => (
 *     <Admin dataProvider={dataProvider}>
 *         <Resource name="posts" list={PostList} />
 *     </Admin>
 * );
 *
 * export default App;
 */
const countDiff = (o1, o2) => omitBy(o1, (v, k) => o2[k] === v);
const composeFilter = (paramsFilter) => {
    const flatFilter = fetchUtils.flattenObject(paramsFilter);
    return Object.keys(flatFilter).map((key) => {
        const splitKey = key.split(/\|\||:/);
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/gi;
        let field = splitKey[0];
        let ops = splitKey[1];
        if (!ops) {
            if (typeof flatFilter[key] === 'boolean' || typeof flatFilter[key] === 'number' || (typeof flatFilter[key] === 'string' && (flatFilter[key].match(/^\d+$/)) || flatFilter[key].match(uuidRegex))) {
                ops = CondOperator.EQUALS;
            }
            else {
                ops = CondOperator.CONTAINS_LOW;
            }
        }
        if (field.startsWith('_') && field.includes('.')) {
            field = field.split(/\.(.+)/)[1];
        }
        return { field, operator: ops, value: flatFilter[key] };
    });
};
const composeQueryParams = (queryParams = {}) => {
    return stringify(fetchUtils.flattenObject(queryParams), { skipNull: true });
};
const mergeEncodedQueries = (...encodedQueries) => encodedQueries.map((query) => query).join('&');
export default (apiUrl, httpClient = fetchUtils.fetchJson) => ({
    getList: (resource, params) => {
        const { page, perPage } = params.pagination;
        const _a = params.filter || {}, { q: queryParams, $OR: orFilter } = _a, filter = __rest(_a, ["q", "$OR"]);
        const encodedQueryParams = composeQueryParams(queryParams);
        const encodedQueryFilter = RequestQueryBuilder.create({
            filter: composeFilter(filter),
            or: composeFilter(orFilter || {})
        })
            .setLimit(perPage)
            .setPage(page)
            .sortBy(params.sort)
            .setOffset((page - 1) * perPage)
            .query();
        const query = mergeEncodedQueries(encodedQueryParams, encodedQueryFilter);
        const url = `${apiUrl}/${resource}?${query}`;
        return httpClient(url).then(({ json }) => ({
            data: json.data,
            total: json.total,
        }));
    },
    getOne: (resource, params) => httpClient(`${apiUrl}/${resource}/${params.id}`).then(({ json }) => ({
        data: json,
    })),
    getMany: (resource, params) => {
        const query = RequestQueryBuilder.create()
            .setFilter({
            field: 'id',
            operator: CondOperator.IN,
            value: `${params.ids}`,
        })
            .query();
        const url = `${apiUrl}/${resource}?${query}`;
        return httpClient(url).then(({ json }) => ({ data: json.data || json }));
    },
    getManyReference: (resource, params) => {
        const { page, perPage } = params.pagination;
        const _a = params.filter || {}, { q: queryParams } = _a, otherFilters = __rest(_a, ["q"]);
        const filter = composeFilter(otherFilters);
        filter.push({
            field: params.target,
            operator: CondOperator.EQUALS,
            value: params.id,
        });
        const encodedQueryParams = composeQueryParams(queryParams);
        const encodedQueryFilter = RequestQueryBuilder.create({
            filter
        })
            .sortBy(params.sort)
            .setLimit(perPage)
            .setOffset((page - 1) * perPage)
            .query();
        const query = mergeEncodedQueries(encodedQueryParams, encodedQueryFilter);
        const url = `${apiUrl}/${resource}?${query}`;
        return httpClient(url).then(({ json }) => ({
            data: json.data,
            total: json.total,
        }));
    },
    update: (resource, params) => {
        // no need to send all fields, only updated fields are enough
        const data = countDiff(params.data, params.previousData);
        return httpClient(`${apiUrl}/${resource}/${params.id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        }).then(({ json }) => ({ data: json }));
    },
    updateMany: (resource, params) => Promise.all(params.ids.map((id) => httpClient(`${apiUrl}/${resource}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(params.data),
    }))).then((responses) => ({
        data: responses.map(({ json }) => json),
    })),
    create: (resource, params) => httpClient(`${apiUrl}/${resource}`, {
        method: 'POST',
        body: JSON.stringify(params.data),
    }).then(({ json }) => ({
        data: Object.assign(Object.assign({}, params.data), { id: json.id }),
    })),
    delete: (resource, params) => httpClient(`${apiUrl}/${resource}/${params.id}`, {
        method: 'DELETE',
    }).then(({ json }) => ({ data: Object.assign(Object.assign({}, json), { id: params.id }) })),
    deleteMany: (resource, params) => Promise.all(params.ids.map((id) => httpClient(`${apiUrl}/${resource}/${id}`, {
        method: 'DELETE',
    }))).then((responses) => ({ data: responses.map(({ json }) => json) })),
});
