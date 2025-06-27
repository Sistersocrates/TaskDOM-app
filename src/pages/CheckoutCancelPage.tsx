import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { Card, CardBody } from '../components/ui/Card';
import { XCircle } from 'lucide-react';
import Button from '../components/ui/Button';

const CheckoutCancelPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="min-h-[80vh] flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardBody className="text-center p-8">
            <div className="flex justify-center mb-6">
              <XCircle className="h-16 w-16 text-error-500" />
            </div>
            
            <h1 className="text-2xl font-bold mb-4">Checkout Cancelled</h1>
            <p className="text-neutral-600 mb-6">
              Your payment was cancelled and you have not been charged.
              If you have any questions, please don't hesitate to contact us.
            </p>
            
            <div className="space-y-4">
              <Button
                onClick={() => navigate('/pricing')}
                fullWidth
              >
                Return to Pricing
              </Button>
              
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                fullWidth
              >
                Return to Home
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CheckoutCancelPage;