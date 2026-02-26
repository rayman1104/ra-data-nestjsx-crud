import {
  List,
  Datagrid,
  TextField,
  DateField,
  ReferenceField,
  Create,
  SimpleForm,
  TextInput,
  ReferenceInput,
  Edit,
  Show,
  SimpleShowLayout,
  EditButton,
} from 'react-admin';

export const CommentList = () => (
  <List>
    <Datagrid>
      <TextField source="id" />
      <ReferenceField source="postId" reference="posts">
        <TextField source="title" />
      </ReferenceField>
      <TextField source="author" />
      <TextField source="body" />
      <DateField source="createdAt" />
      <EditButton />
    </Datagrid>
  </List>
);

export const CommentCreate = () => (
  <Create>
    <SimpleForm>
      <ReferenceInput source="postId" reference="posts" />
      <TextInput source="author" />
      <TextInput source="body" multiline rows={3} />
    </SimpleForm>
  </Create>
);

export const CommentEdit = () => (
  <Edit>
    <SimpleForm>
      <ReferenceInput source="postId" reference="posts" />
      <TextInput source="author" />
      <TextInput source="body" multiline rows={3} />
    </SimpleForm>
  </Edit>
);

export const CommentShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" />
      <ReferenceField source="postId" reference="posts">
        <TextField source="title" />
      </ReferenceField>
      <TextField source="author" />
      <TextField source="body" />
      <DateField source="createdAt" />
    </SimpleShowLayout>
  </Show>
);
