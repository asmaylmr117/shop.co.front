import { useState } from 'react';
import { Users, Target, Award, Heart, Mail, Phone, MapPin, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
    const [expandedFaq, setExpandedFaq] = useState(null);

    const stats = [
        { icon: Users, label: 'Happy Customers', value: '10,000+' },
        { icon: Award, label: 'Years of Experience', value: '5+' },
        { icon: Heart, label: 'Products Sold', value: '50,000+' },
        { icon: Target, label: 'Countries Served', value: '25+' }
    ];

    const team = [
        {
            name: 'john Johnson',
            role: 'CEO & Founder',
            image: 'https://png.pngtree.com/background/20240204/original/pngtree-handsome-young-man-smiling-people-beard-smiling-photo-picture-image_7570357.jpg',
            description: 'Passionate about bringing quality fashion to everyone.'
        },
        {
            name: 'Michael Chen',
            role: 'Head of Design',
            image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
            description: 'Creating timeless designs that speak to modern lifestyle.'
        },
        {
            name: 'Dani Davis',
            role: 'Customer Success Manager',
            image: 'https://png.pngtree.com/background/20240328/original/pngtree-young-handsome-man-smiling-to-you-real-people-young-man-eyes-picture-image_8278274.jpg',
            description: 'Ensuring every customer has an amazing experience.'
        }
    ];

    const testimonials = [
        {
            name: 'Alex Thompson',
            role: 'Regular Customer',
            content: 'SHOP.CO has become my go-to store for quality fashion. The customer service is exceptional!',
            rating: 5
        },
        {
            name: 'Maria Rodriguez',
            role: 'Fashion Blogger',
            content: 'I love the variety and quality of products. Always find something unique here.',
            rating: 5
        },
        {
            name: 'David Kim',
            role: 'Business Professional',
            content: 'Great quality clothing at reasonable prices. Fast shipping and excellent packaging.',
            rating: 5
        }
    ];

    const faqs = [
        {
            question: 'What is your return policy?',
            answer: 'We offer a 30-day return policy for all unworn items with original tags. Returns are free and easy through our online portal.'
        },
        {
            question: 'How long does shipping take?',
            answer: 'Standard shipping takes 3-5 business days, while express shipping takes 1-2 business days. Free shipping on orders over $75.'
        },
        {
            question: 'Do you ship internationally?',
            answer: 'Yes, we ship to over 25 countries worldwide. International shipping times vary by location, typically 7-14 business days.'
        },
        {
            question: 'How can I track my order?',
            answer: 'Once your order ships, you\'ll receive a tracking number via email. You can also track orders in your account dashboard.'
        },
        {
            question: 'What payment methods do you accept?',
            answer: 'We accept all major credit cards, PayPal, Apple Pay, Google Pay, and Buy Now Pay Later options.'
        }
    ];

    const toggleFaq = (index) => {
        setExpandedFaq(expandedFaq === index ? null : index);
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
            />
        ));
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-5xl font-bold mb-6">About SHOP.CO</h1>
                        <p className="text-xl mb-8 max-w-3xl mx-auto">
                            We're passionate about bringing you the latest fashion trends with exceptional quality and unbeatable customer service.
                        </p>
                        <div className="flex justify-center space-x-4">
                            <Link to="/shop" className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                                Shop Now
                            </Link>
                            <Link
                                to="/contact"
                                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors"
                            >
                                Contact Us
                            </Link>

                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => {
                            const IconComponent = stat.icon;
                            return (
                                <div key={index} className="text-center">
                                    <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <IconComponent className="h-8 w-8 text-indigo-600" />
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                                    <div className="text-gray-600">{stat.label}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Our Story Section */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
                            <div className="space-y-4 text-gray-600">
                                <p>
                                    Founded in 2019, SHOP.CO started with a simple mission: to make high-quality fashion accessible to everyone.
                                    What began as a small online boutique has grown into a global fashion destination serving customers in over 25 countries.
                                </p>
                                <p>
                                    We believe that great style shouldn't break the bank, and exceptional customer service should be the standard, not the exception.
                                    Every piece in our collection is carefully curated to ensure it meets our high standards for quality, style, and value.
                                </p>
                                <p>
                                    Today, we're proud to have helped over 10,000 customers express their unique style while building a community
                                    that celebrates diversity, creativity, and self-expression through fashion.
                                </p>
                            </div>
                        </div>
                        <div className="relative">
                            <img
                                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                                alt="Our Story"
                                className="rounded-lg shadow-xl"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Values */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission & Values</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            We're driven by core values that guide everything we do.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Heart className="h-8 w-8 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Customer First</h3>
                            <p className="text-gray-600">
                                Every decision we make is with our customers in mind. Your satisfaction is our top priority.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Award className="h-8 w-8 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Quality Excellence</h3>
                            <p className="text-gray-600">
                                We never compromise on quality. Every product is carefully selected and tested.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Target className="h-8 w-8 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Innovation</h3>
                            <p className="text-gray-600">
                                We continuously evolve and improve to provide the best shopping experience.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            The passionate people behind SHOP.CO who make it all happen.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {team.map((member, index) => (
                            <div key={index} className="text-center">
                                <div className="relative mb-4">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-32 h-32 rounded-full mx-auto object-cover"
                                    />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                                <p className="text-indigo-600 font-medium mb-3">{member.role}</p>
                                <p className="text-gray-600">{member.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
                        <p className="text-xl text-gray-600">Don't just take our word for it</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                                <div className="flex mb-3">
                                    {renderStars(testimonial.rating)}
                                </div>
                                <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                                <div>
                                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                        <p className="text-xl text-gray-600">Find answers to common questions about SHOP.CO</p>
                    </div>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg">
                                <button
                                    onClick={() => toggleFaq(index)}
                                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                                >
                                    <span className="font-semibold text-gray-900">{faq.question}</span>
                                    {expandedFaq === index ? (
                                        <ChevronUp className="h-5 w-5 text-gray-500" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-gray-500" />
                                    )}
                                </button>
                                {expandedFaq === index && (
                                    <div className="px-6 pb-4">
                                        <p className="text-gray-600">{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-16 bg-indigo-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
                        <p className="text-xl opacity-90">We'd love to hear from you</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div>
                            <div className="bg-white bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mail className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Email Us</h3>
                            <p className="opacity-90">support@shop.co</p>
                        </div>
                        <div>
                            <div className="bg-white bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Phone className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Call Us</h3>
                            <p className="opacity-90">+1 (555) 123-4567</p>
                        </div>
                        <div>
                            <div className="bg-white bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MapPin className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Visit Us</h3>
                            <p className="opacity-90">123 Fashion Street<br />New York, NY 10001</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}