import { Admin, Resource } from 'react-admin';
import crudProvider from 'ra-data-nestjsx-crud';
import { PostList, PostCreate, PostEdit, PostShow } from './posts';
import { CommentList, CommentCreate, CommentEdit, CommentShow } from './comments';

const dataProvider = crudProvider('http://localhost:3000');

export const App = () => (
  <Admin dataProvider={dataProvider}>
    <Resource
      name="posts"
      list={PostList}
      create={PostCreate}
      edit={PostEdit}
      show={PostShow}
    />
    <Resource
      name="comments"
      list={CommentList}
      create={CommentCreate}
      edit={CommentEdit}
      show={CommentShow}
    />
  </Admin>
);
