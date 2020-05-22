# Nest.js API Data Provider For React-Admin

```ra-data-nestjsx-crud``` is a fork of [@FusionWorks/ra-data-nest-crud](https://github.com/FusionWorks/react-admin-nestjsx-crud-dataprovider).

```ra-data-nestjsx-crud``` is a data-provider for [react-admin](https://github.com/marmelab/react-admin), that has been designed to make easier communication between a frontend application built with [react-admin](https://github.com/marmelab/react-admin),
and a backend application built with [nestjs](https://github.com/nestjs/nest) framework and [nestjsx/crud](https://github.com/nestjsx/crud).

## Install

Using **npm**:
```npm i ra-data-nestjsx-crud```

Using **yarn**:
```yarn add ra-data-nestjsx-crud```

## Usage

```jsx
// in app.jsx file

import React from 'react';
import { Admin, Resource, ShowGuesser } from 'react-admin';
import crudProvider from 'ra-data-nestjsx-crud'
import { UsersList, UserCreate, UserEdit } from './Users'

const dataProvider = crudProvider('http://localhost:3000');
const App = () => (
  <Admin dataProvider={dataProvider}>
    <Resource name="users" list={UsersList} create={UserCreate} edit={UserEdit} show={ShowGuesser} />
  </Admin>
);
export default App;
```
