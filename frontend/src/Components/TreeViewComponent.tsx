import React, { useState, useEffect, useMemo } from 'react';
import { TextField, ListItem, ListItemText, Box } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { FixedSizeList as VirtualList } from 'react-window';
import _ from 'lodash';

interface TreeNode {
    name: string;
    size: number;
    children?: TreeNode[];
}

const apiURL = import.meta.env.VITE_REACT_APP_BACKEND_API_URL as string;

const TreeViewComponent: React.FC = () => {
    const [treeData, setTreeData] = useState<TreeNode[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredData, setFilteredData] = useState<TreeNode[]>([]);
    const [openNodes, setOpenNodes] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        fetch(`${apiURL}/api/getTreeData`)
            .then((response) => response.json())
            .then((data: TreeNode[]) => {
                setTreeData(data);
                setFilteredData(data);
            });
    }, []);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const term = event.target.value;
        setSearchTerm(term);
        if (term === '') {
            setFilteredData(treeData);
        } else {
            const filtered = filterTreeData(treeData, term);
            setFilteredData(filtered);
        }
    };

    const filterTreeData = useMemo(() => {
        const filterTree = (data: TreeNode[], term: string): TreeNode[] => {
            return _.compact(
                _.map(data, (node: TreeNode) => {
                    if (_.includes(node.name.toLowerCase(), term.toLowerCase())) {
                        return { ...node };
                    }
                    if (node.children) {
                        const children = filterTree(node.children, term);
                        if (children.length > 0) {
                            return { ...node, children };
                        }
                    }
                    return null;
                })
            ) as TreeNode[];
        };
        return (data: TreeNode[], term: string): TreeNode[] => filterTree(data, term);
    }, []);


    const handleToggle = (nodeName: string) => {
        setOpenNodes(prev => ({ ...prev, [nodeName]: !prev[nodeName] }));
    };

    const flattenedData = useMemo(() => {
        const flatten = (nodes: TreeNode[], level = 0): { node: TreeNode; level: number }[] => {
            return nodes.reduce((acc, node) => {
                acc.push({ node, level });
                if (openNodes[node.name] && node.children) {
                    acc = acc.concat(flatten(node.children, level + 1));
                }
                return acc;
            }, [] as { node: TreeNode; level: number }[]);
        };
        return flatten(filteredData);
    }, [filteredData, openNodes]);

    const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        const { node, level } = flattenedData[index];
        return (
            <div style={style} >
                <ListItem
                    button
                    onClick={() => handleToggle(node.name)}
                    style={{
                        marginLeft: level * 16,
                        maxWidth: 700,
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                        borderRadius: '10px',
                        backgroundColor: 'lightblue',
                    }}
                >
                    <Box
                        display={'flex'} alignItems={'center'} justifyContent={'space-between'} width={"100%"}
                        sx={{
                            borderLeft: `2px solid ${level === 0 ? 'black' : 'gray'}`,
                            paddingLeft: 8,
                        }}
                    >
                        <ListItemText primary={`${node.name} ${node?.children?.length !== 0 ? `(${node?.children?.length})` : ''}`} />
                        {node.children && node.children.length !== 0 && (openNodes[node.name] ? <ExpandLess /> : <ExpandMore />)}
                    </Box>
                </ListItem>
            </div>
        );
    };

    return (
        <div>
            <TextField
                label="Search by Name"
                variant="outlined"
                value={searchTerm}
                onChange={handleSearch}
                fullWidth
                margin="normal"
                size='small'
            />
            <VirtualList
                height={600}
                width="100%"
                itemSize={50}
                itemCount={flattenedData.length}
            >
                {Row}
            </VirtualList>
        </div>
    );
};

export default TreeViewComponent;
