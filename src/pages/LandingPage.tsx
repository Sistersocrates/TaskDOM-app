import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Star, Shield, Clock, Users, Volume2, Flame, ChevronRight } from 'lucide-react';
import Button from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { motion } from 'framer-motion';
import { bookCoverService } from '../services/bookCoverService';
import { mockBooks } from '../utils/mockData';

const LandingPage: React.FC = () => {
  const [featuredBook, setFeaturedBook] = useState(mockBooks[3]); // King of Battle and Blood
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const enhanceBookCover = async () => {
      setIsLoading(true);
      try {
        console.log('Enhancing featured book cover for landing page...');
        const enhancedCover = await bookCoverService.getBestCoverImage(featuredBook);
        setFeaturedBook({
          ...featuredBook,
          coverImage: enhancedCover
        });
        console.log('Successfully enhanced featured book cover for landing page');
      } catch (error) {
        console.error('Error enhancing featured book cover:', error);
      } finally {
        setIsLoading(false);
      }
    };

    enhanceBookCover();
  }, []);

  return (
    <div className="min-h-screen bg-background text-primary-text">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/30 to-transparent pointer-events-none z-0"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-cinzel text-white">
                  Your <span className="text-accent-text">Spicy</span> Reading Companion
                </h1>
                <p className="text-xl md:text-2xl mb-8 text-gray-300">
                  Track your reading progress, build streaks, and get personalized encouragement with TaskDOM.
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <Link to="/login">
                    <Button size="lg" className="w-full sm:w-auto">
                      Get Started
                    </Button>
                  </Link>
                  <Link to="/pricing">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      View Pricing
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
            <div className="md:w-1/2 flex justify-center md:justify-end">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative"
              >
                <div className="w-80 h-[480px] bg-card rounded-xl overflow-hidden shadow-red-lg border border-accent/30">
                  <img 
                    src="/scarlet-cursed.jpg" 
                    alt="Scarlet Cursed" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/6373305/pexels-photo-6373305.jpeg";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                    <h3 className="text-xl font-bold text-white">Scarlet Cursed</h3>
                    <p className="text-gray-300">Dora Blume</p>
                    <div className="flex items-center mt-2">
                      <div className="flex">
                        {Array(5).fill(0).map((_, i) => (
                          <span key={i} className="text-accent">🌶️</span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 bg-accent/20 rounded-lg p-2 border border-accent/30">
                      <div className="flex justify-between text-sm text-white mb-1">
                        <span>Reading Progress</span>
                        <span>25%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-accent h-2 rounded-full" style={{ width: '25%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 bg-card p-4 rounded-lg shadow-red border border-accent/30">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent-text">5</div>
                    <div className="text-xs text-gray-400">Day Streak</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-b from-background to-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-cinzel text-white">Features Designed for Readers</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Everything you need to enhance your reading experience and stay motivated.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <BookOpen className="h-8 w-8 text-accent" />,
                title: 'Reading Progress Tracking',
                description: 'Track your reading progress across multiple books with automatic syncing across devices.'
              },
              {
                icon: <Flame className="h-8 w-8 text-accent" />,
                title: 'Streak Building',
                description: 'Build and maintain reading streaks with daily goals and motivational reminders.'
              },
              {
                icon: <Volume2 className="h-8 w-8 text-accent" />,
                title: 'Voice Encouragement',
                description: 'Receive personalized voice encouragement in multiple styles to keep you motivated.'
              },
              {
                icon: <Star className="h-8 w-8 text-accent" />,
                title: 'Spicy Scene Tracking',
                description: 'Mark and organize spicy scenes for easy reference and sharing with the community.'
              },
              {
                icon: <Users className="h-8 w-8 text-accent" />,
                title: 'Book Clubs',
                description: 'Join or create book clubs to discuss your favorite reads with like-minded readers.'
              },
              {
                icon: <Clock className="h-8 w-8 text-accent" />,
                title: 'Reading Timer',
                description: 'Set focused reading sessions with our customizable timer and get praise when you finish.'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:border-accent/50 transition-all duration-300">
                  <CardBody className="p-6">
                    <div className="p-3 bg-accent/20 rounded-lg border border-accent/30 inline-block mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Themed Days Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-cinzel text-white">Themed Days</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Each day brings new challenges, rewards, and spicy content.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { day: 'Sinful Sunday', icon: '😈', color: 'from-purple-900/30 to-purple-800/10 border-purple-700/30' },
              { day: 'Manic Monday', icon: '🔥', color: 'from-red-900/30 to-red-800/10 border-red-700/30' },
              { day: 'Wild Wednesday', icon: '🌿', color: 'from-green-900/30 to-green-800/10 border-green-700/30' },
              { day: 'Feral Friday', icon: '🐺', color: 'from-pink-900/30 to-pink-800/10 border-pink-700/30' }
            ].map((theme, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className={`p-6 rounded-xl bg-gradient-to-br ${theme.color} text-center`}>
                  <div className="text-4xl mb-3">{theme.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{theme.day}</h3>
                  <p className="text-sm text-gray-300">Special challenges and rewards</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-cinzel text-white">What Our Readers Say</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Join thousands of satisfied readers who have transformed their reading habits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "TaskDOM has completely transformed my reading habits. The voice encouragement keeps me motivated, and I've read more books in the last month than I did all last year!",
                name: "Sophia",
                title: "Romance Enthusiast",
                avatar: "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg"
              },
              {
                quote: "The spicy scene tracking feature is a game-changer! I love being able to easily find and share my favorite moments with my book club.",
                name: "Emma",
                title: "Book Club Host",
                avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg"
              },
              {
                quote: "I never thought I'd be motivated by a reading app, but the streak system and themed days keep me coming back. I'm on a 30-day streak and counting!",
                name: "Olivia",
                title: "Fantasy Reader",
                avatar: "https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <CardBody className="p-6">
                    <div className="flex items-center mb-4">
                      <img 
                        src={testimonial.avatar} 
                        alt={testimonial.name} 
                        className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-accent/50"
                      />
                      <div>
                        <h4 className="font-bold text-white">{testimonial.name}</h4>
                        <p className="text-sm text-gray-400">{testimonial.title}</p>
                      </div>
                    </div>
                    <p className="text-gray-300 italic">"{testimonial.quote}"</p>
                    <div className="mt-4 flex text-accent">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-accent/20 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card border border-accent/30 rounded-xl p-8 md:p-12 shadow-red">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-8 md:mb-0 md:mr-8">
                <h2 className="text-3xl font-bold mb-4 font-cinzel text-white">Ready to Transform Your Reading Experience?</h2>
                <p className="text-xl text-gray-300 mb-6">
                  Join TaskDOM today and start your journey to more consistent, enjoyable reading.
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <Link to="/login">
                    <Button size="lg" className="w-full sm:w-auto">
                      Get Started Free
                    </Button>
                  </Link>
                  <Link to="/pricing">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      View Plans
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex flex-col space-y-4 bg-background/50 p-6 rounded-lg border border-border">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-accent mr-3" />
                  <span className="text-gray-300">14-day free trial</span>
                </div>
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-accent mr-3" />
                  <span className="text-gray-300">No credit card required</span>
                </div>
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-accent mr-3" />
                  <span className="text-gray-300">Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="h-10 w-10 bg-gradient-to-br from-accent to-accent-hover rounded-lg flex items-center justify-center mr-3">
                <BookOpen className="h-6 w-6 text-accent-text" />
              </div>
              <span className="text-2xl font-bold font-cinzel text-white">TaskDOM</span>
            </div>
            <div className="flex space-x-6">
              <Link to="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} TaskDOM. All rights reserved.</p>
            <p className="mt-2">Your spicy reading companion for consistent, motivated reading.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

