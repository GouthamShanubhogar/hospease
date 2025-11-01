import React from 'react';
import { Card, CardContent, Typography, Chip } from '@mui/material';

const TokenDisplay = ({ tokenNumber, currentToken, estimatedWait }) => {
  const getStatusColor = () => {
    if (tokenNumber === currentToken) return 'success';
    if (tokenNumber < currentToken) return 'default';
    const remaining = tokenNumber - currentToken;
    if (remaining <= 3) return 'warning';
    return 'primary';
  };

  return (
    <Card variant="outlined" className="mb-4">
      <CardContent>
        <div className="flex justify-between items-center">
          <div>
            <Typography variant="subtitle2" color="text.secondary">
              Your Token
            </Typography>
            <Typography variant="h3">
              {tokenNumber}
            </Typography>
          </div>
          <div className="text-right">
            <Typography variant="subtitle2" color="text.secondary">
              Current Token
            </Typography>
            <Typography variant="h4">
              {currentToken}
            </Typography>
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <Chip
            label={tokenNumber === currentToken ? "It's your turn!" : 
                  tokenNumber < currentToken ? "Completed" :
                  `${tokenNumber - currentToken} tokens away`}
            color={getStatusColor()}
          />
          {estimatedWait > 0 && (
            <Typography variant="body2" color="text.secondary">
              Est. wait: ~{estimatedWait} mins
            </Typography>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenDisplay;