import React, { useState } from 'react';
import { X, Share2, BookOpen, Target, Flame, List } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import SocialShareButton from './SocialShareButton';
import { cn } from '../../utils/cn';

interface ShareableContent {
  type: 'progress' | 'reading_list' | 'tbr' | 'streak' | 'achievement' | 'book_review';
  title: string;
  description: string;
  data: any;
  hashtags: string[];
  imageUrl?: string;
}

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: ShareableContent;
  className?: string;
}

const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  content,
  className
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState(0);

  if (!isOpen) return null;

  const generateShareUrl = () => {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams({
      type: content.type,
      title: content.title,
      description: content.description,
      data: JSON.stringify(content.data)
    });
    return `${baseUrl}/share?${params.toString()}`;
  };

  const shareUrl = generateShareUrl();

  const getShareTemplates = () => {
    switch (content.type) {
      case 'progress':
        return [
          {
            title: `📚 Reading Progress Update!`,
            description: `Just finished ${content.data.pagesRead} pages of "${content.data.bookTitle}" by ${content.data.author}. ${content.data.percentage}% complete! 🔥`
          },
          {
            title: `📖 Currently Reading`,
            description: `Making great progress on "${content.data.bookTitle}" - ${content.data.percentage}% done and loving every page! What are you reading?`
          },
          {
            title: `🎯 Reading Goal Update`,
            description: `${content.data.percentage}% through "${content.data.bookTitle}" and completely hooked! This book is incredible! 📚✨`
          }
        ];
      case 'streak':
        return [
          {
            title: `🔥 ${content.data.days} Day Reading Streak!`,
            description: `I've been reading consistently for ${content.data.days} days straight! Building this habit one page at a time 📚💪`
          },
          {
            title: `📚 Streak Status: ON FIRE!`,
            description: `${content.data.days} days of reading in a row! Who else is building their reading habit? Let's motivate each other! 🔥`
          },
          {
            title: `💪 Reading Consistency`,
            description: `Day ${content.data.days} of my reading streak! Proof that small daily habits create big results 📖✨`
          }
        ];
      case 'tbr':
        return [
          {
            title: `📚 My To-Be-Read List`,
            description: `Check out my TBR pile! ${content.data.books.length} amazing books waiting to be devoured. Any recommendations? 📖`
          },
          {
            title: `🎯 Reading Goals`,
            description: `My TBR list is growing! ${content.data.books.length} books lined up including some spicy romance picks 🌶️📚`
          },
          {
            title: `📖 Book Recommendations Needed!`,
            description: `My TBR has ${content.data.books.length} books but I'm always looking for more! What should I add next? 📚✨`
          }
        ];
      case 'reading_list':
        return [
          {
            title: `📚 My Reading Library`,
            description: `${content.data.totalBooks} books in my collection! Currently reading ${content.data.currentlyReading} and finished ${content.data.completed} this year 🎉`
          },
          {
            title: `📖 Book Collection Update`,
            description: `My digital library is growing! ${content.data.totalBooks} books and counting. What's in your collection? 📚`
          },
          {
            title: `🎯 Reading Stats`,
            description: `Library update: ${content.data.totalBooks} books total, ${content.data.completed} finished this year! Reading is my superpower 💪📚`
          }
        ];
      default:
        return [
          {
            title: content.title,
            description: content.description
          }
        ];
    }
  };

  const templates = getShareTemplates();
  const selectedContent = templates[selectedTemplate];

  const getTypeIcon = () => {
    switch (content.type) {
      case 'progress': return BookOpen;
      case 'streak': return Flame;
      case 'tbr': return List;
      case 'reading_list': return BookOpen;
      default: return Share2;
    }
  };

  const TypeIcon = getTypeIcon();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className={cn("max-w-2xl w-full max-h-[90vh] overflow-y-auto", className)}>
        <CardHeader className="flex items-center justify-between border-b border-red-900/30">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-900/20 rounded-lg">
              <TypeIcon className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Share Your Reading Journey</h2>
              <p className="text-gray-400">Inspire others with your reading progress</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </CardHeader>

        <CardBody className="space-y-6">
          {/* Template Selection */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Choose Your Message Style</h3>
            <div className="grid grid-cols-1 gap-3">
              {templates.map((template, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedTemplate(index)}
                  className={cn(
                    'p-4 text-left border rounded-lg transition-all',
                    selectedTemplate === index
                      ? 'border-red-500 bg-red-900/20'
                      : 'border-gray-700 hover:border-red-500/50 bg-gray-800'
                  )}
                >
                  <h4 className="font-medium text-white mb-1">{template.title}</h4>
                  <p className="text-sm text-gray-400">{template.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-3">Preview</h3>
            <div className="bg-gray-900 p-4 rounded-lg">
              <h4 className="font-bold text-white mb-2">{selectedContent.title}</h4>
              <p className="text-gray-300 mb-3">{selectedContent.description}</p>
              <div className="flex flex-wrap gap-1">
                {content.hashtags.map((hashtag, index) => (
                  <span key={index} className="text-red-400 text-sm">
                    #{hashtag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Social Media Buttons */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Share On</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <SocialShareButton
                platform="facebook"
                url={shareUrl}
                title={selectedContent.title}
                description={selectedContent.description}
                hashtags={content.hashtags}
                variant="pill"
                size="sm"
                className="w-full justify-center"
              />
              <SocialShareButton
                platform="twitter"
                url={shareUrl}
                title={selectedContent.title}
                description={selectedContent.description}
                hashtags={content.hashtags}
                variant="pill"
                size="sm"
                className="w-full justify-center"
              />
              <SocialShareButton
                platform="linkedin"
                url={shareUrl}
                title={selectedContent.title}
                description={selectedContent.description}
                hashtags={content.hashtags}
                variant="pill"
                size="sm"
                className="w-full justify-center"
              />
              <SocialShareButton
                platform="copy"
                url={shareUrl}
                title={selectedContent.title}
                description={selectedContent.description}
                hashtags={content.hashtags}
                variant="pill"
                size="sm"
                className="w-full justify-center"
              />
            </div>
          </div>

          {/* Instagram Special Instructions */}
          <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 p-4 rounded-lg">
            <h4 className="font-medium text-white mb-2 flex items-center">
              <Instagram className="h-5 w-5 mr-2" />
              Instagram Sharing
            </h4>
            <p className="text-sm text-gray-300">
              Instagram doesn't support direct link sharing. Use the "Copy Link" button above, 
              then paste the link in your Instagram story or bio to share your reading progress!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t border-gray-700">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Close
            </Button>
            <SocialShareButton
              platform="copy"
              url={shareUrl}
              title={selectedContent.title}
              description={selectedContent.description}
              hashtags={content.hashtags}
              className="flex-1"
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default SocialShareModal;