import {
  List,
  Datagrid,
  TextField,
  BooleanField,
  DateField,
  Create,
  SimpleForm,
  TextInput,
  BooleanInput,
  Edit,
  Show,
  SimpleShowLayout,
  ReferenceManyField,
  EditButton,
  ShowButton,
} from 'react-admin';

export const PostList = () => (
  <List>
    <Datagrid>
      <TextField source="id" />
      <TextField source="title" />
      <BooleanField source="isPublished" />
      <DateField source="createdAt" />
      <EditButton />
      <ShowButton />
    </Datagrid>
  </List>
);

export const PostCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="title" />
      <TextInput source="body" multiline rows={4} />
      <BooleanInput source="isPublished" />
    </SimpleForm>
  </Create>
);

export const PostEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="title" />
      <TextInput source="body" multiline rows={4} />
      <BooleanInput source="isPublished" />
    </SimpleForm>
  </Edit>
);

export const PostShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="title" />
      <TextField source="body" />
      <BooleanField source="isPublished" />
      <DateField source="createdAt" />
      <ReferenceManyField label="Comments" reference="comments" target="postId">
        <Datagrid>
          <TextField source="id" />
          <TextField source="author" />
          <TextField source="body" />
          <DateField source="createdAt" />
        </Datagrid>
      </ReferenceManyField>
    </SimpleShowLayout>
  </Show>
);
