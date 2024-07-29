import React, { useState } from 'react';
import { Box, Container, TextField, Button, Typography } from '@mui/material';
import TreeNode from './Components/TreeNode';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TreeViewComponent from './Components/TreeViewComponent';

interface TreeNodeData {
  name: string;
  size: number;
  children: TreeNodeData[] | null;
  next: string;
}

const apiURL = import.meta.env.VITE_REACT_APP_BACKEND_API_URL as string;

const App: React.FC = () => {
  const [treeData, setTreeData] = useState<TreeNodeData[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchData = async (name: string) => {
    const response = await fetch(`${apiURL}/api/subcategories/${name}`);
    const data = await response.json();
    return data;
  };

  const handleToggle = async (node: TreeNodeData) => {
    if (!node.children) {
      const data = await fetchData(node.next);
      node.children = data.map((item: any) => ({
        name: item.next,
        size: item.size,
        children: null,
        next: item.next,
      }));
      setTreeData([...treeData]);
    }
  };

  const handleSearch = async () => {
    const data = await fetchData(searchTerm);
    setTreeData(data.map((item: any) => ({
      name: item.next,
      size: item.size,
      children: null,
      next: item.next,
    })));
  };

  return (
    <>
      <Container maxWidth={"xl"}>
        <Box my={3}>
          <Typography variant='h5' textAlign={'center'}>
            Image Tree Set
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', mb: 2 }}>
          <TextField
            label="Search name"
            variant="outlined"
            value={searchTerm}
            size='small'
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
          />
          <Button variant="contained" color="secondary" sx={{ ml: 2 }} onClick={handleSearch}>
            Search
          </Button>
        </Box>

        <Button variant="contained" onClick={async () => {
          const data = await fetchData('ImageNet 2011 Fall Release');
          setTreeData(data.map((item: any) => ({
            name: item.next,
            size: item.size,
            children: null,
            next: item.next,
          })));
        }} endIcon={<AccountTreeIcon />}>
          Load Tree Through API
        </Button>
        <hr />
        <Box sx={{ mt: 4 }}>
          <Typography sx={{ ml: 3, mb: 3 }} variant='h6'>{treeData?.[0]?.name.split('>')?.[0]}</Typography>
          {treeData.map(node => (
            <TreeNode key={node.name} node={node} onToggle={handleToggle} />
          ))}
        </Box>
        <TreeViewComponent />
      </Container>
    </>
  );
};

export default App;
