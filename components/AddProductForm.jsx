"use client"

import React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from './ui/button'
import { AuthModal } from './AuthModal'
import { addProduct } from '@/app/actions'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const AddProductForm = ({ user }) => {
    const [url, setUrl] = React.useState('')
    const [loading, setLoading] = React.useState(false)
    const [showAuthModal, setShowAuthModal] = React.useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            setShowAuthModal(true);
            return;
        }

        setLoading(true);

        const result = await addProduct({ url });

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(result.message || 'Product added successfully!');
            setUrl('');
        }

        setLoading(false);
    };


    return (
        <>
            <form onSubmit={handleSubmit} className='w-full max-w-2xl mx-auto'>
                <div className='flex flex-col sm:flex-row gap-2'>
                    <Input type='url'
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder='Enter product URL'
                        className='h-12 text-base'
                        required
                        disabled={loading}
                    />

                    <Button className='bg-orange-500 hover:bg-orange-600 h-10 sm:h-12 px-8'
                        type='submit'
                        disabled={loading}
                        size='lg'
                    >
                        {loading ? (
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        ) : (
                            "Track Price"
                        )}
                    </Button>
                </div>
            </form>
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </>
    )
}

export default AddProductForm