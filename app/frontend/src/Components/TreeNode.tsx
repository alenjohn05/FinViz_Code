import React, { useState } from 'react';
import { Box, Typography, CircularProgress, Card, CardContent, IconButton,styled } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';

interface TreeNodeData {
  name: string;
  size: number;
  children: TreeNodeData[] | null;
  next: string;
}

interface TreeNodeProps {
  node: TreeNodeData;
  onToggle: (node: TreeNodeData) => Promise<void>;
}

const NodeCard = styled(CardContent)({
  paddingBottom: '3px !important',
  paddingTop: '3px !important',
});

const TreeNode: React.FC<TreeNodeProps> = ({ node, onToggle }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(false);

  const handleToggle = async () => {
    if (node.size !== 0) {
      setLoading(true);
      await onToggle(node);
      setLoading(false);
      setExpanded(!expanded);
    }
  };

  const getLastElement = (name: string) => {
    const parts = name.split(' > ');
    return parts[parts.length - 1];
  };

  return (
    <Card variant="outlined" sx={{ mb: 1, ml: 3, px: 2 }}>
      <NodeCard sx={{ display: 'flex', alignItems: 'center' ,pb: 0}}>
        {node.size !== 0 && (
          <IconButton onClick={handleToggle} size="small" color='info' sx={{ mr: 1 }}>
            {loading ? (
              <CircularProgress size={20} />
            ) : (
              expanded ? <ExpandLess /> : <ExpandMore />
            )}
          </IconButton>
        )}
        <Typography variant="body1" sx={{ flexGrow: 1, textTransform: 'capitalize' }}>
          {getLastElement(node.name)} {node.size > 0 ? `(${node.size})` : ''}
        </Typography>
      </NodeCard>
      {expanded && node.children && (
        <Box sx={{ ml: 3 }}>
          {node.children.map(child => (
            <TreeNode key={child.name} node={child} onToggle={onToggle} />
          ))}
        </Box>
      )}
    </Card>
  );
};

export default TreeNode;
