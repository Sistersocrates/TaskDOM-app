import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import SocialMetaTags from '../components/social/SocialMetaTags';
import { BookOpen, Flame, List, Trophy, Star } from 'lucide-react';
import Button from '../components/ui/Button';

const SharePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [shareData, setShareData] = useState<any>(null);

  useEffect(() => {
    const type = searchParams.get('type');
    const title = searchParams.get('title');
    const description = searchParams.get('description');
    const dataParam = searchParams.get('data');

    if (type && title && description) {
      setShareData({
        type,
        title,
        description,
        data: dataParam ? JSON.parse(dataParam) : {}
      });
    }
  }, [searchParams]);

  if (!shareData) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-white mb-4">Invalid Share Link</h1>
          <p className="text-gray-400 mb-6">This share link appears to be invalid or expired.</p>
          <Button onClick={() => window.location.href = '/'}>
            Go to Home
          </Button>
        </div>
      </MainLayout>
    );
  }

  const getTypeIcon = () => {
    switch (shareData.type) {
      case 'progress': return BookOpen;
      case 'streak': return Flame;
      case 'tbr': return List;
      case 'reading_list': return BookOpen;
      case 'achievement': return Trophy;
      case 'book_review': return Star;
      default: return BookOpen;
    }
  };

  const getTypeColor = () => {
    switch (shareData.type) {
      case 'progress': return 'text-blue-400 bg-blue-900/20';
      case 'streak': return 'text-orange-400 bg-orange-900/20';
      case 'tbr': return 'text-purple-400 bg-purple-900/20';
      case 'reading_list': return 'text-green-400 bg-green-900/20';
      case 'achievement': return 'text-yellow-400 bg-yellow-900/20';
      case 'book_review': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const TypeIcon = getTypeIcon();
  const currentUrl = window.location.href;

  return (
    <>
      <SocialMetaTags
        title={shareData.title}
        description={shareData.description}
        url={currentUrl}
        imageUrl={shareData.data.coverImage}
        type="article"
      />
      
      <MainLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-lg ${getTypeColor()}`}>
                  <TypeIcon className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{shareData.title}</h1>
                  <p className="text-gray-400">Shared from TaskDOM</p>
                </div>
              </div>
            </CardHeader>

            <CardBody className="space-y-6">
              <p className="text-lg text-gray-300">{shareData.description}</p>

              {/* Type-specific content */}
              {shareData.type === 'progress' && shareData.data.coverImage && (
                <div className="flex items-center space-x-4">
                  <img
                    src={shareData.data.coverImage}
                    alt={shareData.data.bookTitle}
                    className="w-24 h-36 object-cover rounded-lg shadow-md"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-white">{shareData.data.bookTitle}</h3>
                    <p className="text-gray-400">{shareData.data.author}</p>
                    <div className="mt-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: `${shareData.data.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-400">{shareData.data.percentage}%</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Page {shareData.data.currentPage} of {shareData.data.totalPages}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {shareData.type === 'streak' && (
                <div className="text-center bg-gradient-to-r from-orange-900/20 to-red-900/20 p-6 rounded-lg">
                  <div className="text-6xl mb-4">🔥</div>
                  <h3 className="text-3xl font-bold text-white mb-2">{shareData.data.days} Days</h3>
                  <p className="text-gray-400">Reading Streak</p>
                </div>
              )}

              {shareData.type === 'tbr' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-white">{shareData.data.totalBooks}</div>
                      <div className="text-sm text-gray-400">Total Books</div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-white">{shareData.data.spicyBooks}</div>
                      <div className="text-sm text-gray-400">Spicy Reads 🌶️</div>
                    </div>
                  </div>
                  {shareData.data.books.slice(0, 3).map((book: any, index: number) => (
                    <div key={index} className="bg-gray-800 p-3 rounded-lg">
                      <h4 className="font-medium text-white">{book.title}</h4>
                      <p className="text-sm text-gray-400">{book.author}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="font-medium text-white mb-2">Join TaskDOM</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Track your reading progress, build streaks, and connect with fellow book lovers!
                </p>
                <Button
                  onClick={() => window.location.href = '/'}
                  className="w-full"
                >
                  Start Your Reading Journey
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </MainLayout>
    </>
  );
};

export default SharePage;