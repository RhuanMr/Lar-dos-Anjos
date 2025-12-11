// Extensão de tipos para Material UI Grid v7
// Isso resolve o problema de compatibilidade com a prop 'item'

import '@mui/material';

declare module '@mui/material/Grid' {
  interface GridProps {
    item?: boolean;
    container?: boolean;
  }
}

