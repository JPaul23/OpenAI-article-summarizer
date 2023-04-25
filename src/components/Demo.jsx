import { useEffect, useState } from 'react';

import { copy, linkIcon, loader, tick } from '../assets';
import { useLazyGetSummaryQuery } from '../services/article';

//Regex to test invalid API Key.
const regex = /Invalid API key/i;

const Demo = () => {
    const [article, setArticle] = useState({
        url: '',
        summary: '',
    });

    const [allArticles, setAllArticles] = useState([]);
    const [copied, setCopied] = useState("");

    const [getSummary, { error, isFetching }] = useLazyGetSummaryQuery();

    useEffect(() => {
        const localStorageArticles = JSON.parse(localStorage.getItem('articles'));

        if (localStorageArticles) {
            setAllArticles(localStorageArticles);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { data } = await getSummary({ articleUrl: article.url });

        if (data?.summary) {
            const newArticle = { ...article, summary: data.summary };

            const updatedAllArticles = [newArticle, ...allArticles];

            setArticle(newArticle);
            setAllArticles(updatedAllArticles);

            //updatin the localStorage articles 
            localStorage.setItem('articles', JSON.stringify(updatedAllArticles));
            console.log(newArticle);
        }
    }

    const handleCopyClipboard = (copyUrl) => {
        setCopied(copyUrl);
        navigator.clipboard.writeText(copyUrl);
        setTimeout(() => setCopied(false), 3000);
    }

    return (
        <section className='mt-16 w-full max-w-xl'>
            {/* search */}
            <div className='flex flex-col w-full gap-2'>
                <form
                    className='relative flex justify-center items-center'
                    onSubmit={handleSubmit}
                >
                    <img
                        src={linkIcon}
                        alt='link_icon'
                        className='absolute left-0 my-2 ml-3 w-5'
                    />

                    <input
                        type='url'
                        placeholder='Enter a URL'
                        value={article.url}
                        required
                        className='url_input peer'
                        onChange={(e) => setArticle({
                            ...article, url: e.target.value
                        })}
                    />

                    <button
                        type='submit'
                        className='submit_btn peer-focus:border-gray-700 peer-focus:text-gray-700'
                    >
                        ⏎
                    </button>
                </form>

                {/* Browser URL History */}
                <div className='flex flex-col gap-1 max-h-60 overflow-y-auto'>
                    {allArticles.map((item, index) => (
                        <div
                            key={`link-${index}`}
                            onClick={() => setArticle(item)}
                            className='link_card'
                        >
                            <div className='copy_btn' onClick={() => handleCopyClipboard(item.url)}>
                                <img
                                    src={copied === item.url ? tick : copy}
                                    alt='copy_icon'
                                    className='w-[40%] h-[40%] object-contain'
                                />
                            </div>
                            <p className='flex-1 font-satoshi text-blue-700 font-medium text-sm truncate'>
                                {item.url}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Display Results */}
            <div className='my-10 max-w-full flex justify-center items-center'>
                {isFetching ? (
                    <img src={loader} alt='loader' className='w-20 h-20 object-contain' />
                ) : error ? (
                    <p className='font-inter font-bold text-black text-center'>
                        Well, That wasn't supposed to happen... <br />
                        {regex.test(error?.data?.message) ? (
                            <span className='font-satoshi font-normal text-gray-700'>
                                Sorry, but you are not allowed to use this Service. <br />Contact the Admin for access.
                            </span>

                        ) : (
                            <span className='font-satoshi font-normal text-gray-700'>
                                {error?.data?.error}
                            </span>

                        )}
                    </p>
                ) : (
                    article.summary && (
                        <div className='flex flex-col gap-3'>
                            <h2 className='font-satoshi font-bold text-gray-600 text-xl'>
                                Article {''}
                                <span className='blue_gradient'>
                                    Summary
                                </span>
                            </h2>

                            <div className='summary_box'>
                                <p className='font-inter font-medium text-sm text-gray-700'>{article.summary}</p>
                            </div>
                        </div>
                    )
                )}
            </div>
        </section>
    )
}

export default Demo;