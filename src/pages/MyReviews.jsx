import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../api';
import { 
  MessageSquare, 
  Star, 
  Trash, 
  Edit3, 
  Save, 
  X,
  AlertCircle,
  Clock,
  Layout,
  History,
  Activity,
  ArrowUpRight,
  Monitor,
  ChevronRight,
  Info
} from 'lucide-react';

const MyReviews = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null); // id of review being edited
    const [editData, setEditData] = useState({ rating: 5, comment: '' });

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const { data } = await api.get('/reviews');
            setReviews(data.filter(r => r.customer_id?._id === userInfo._id));
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this review?')) {
            try {
                await api.delete(`/reviews/${id}`);
                fetchReviews();
            } catch (error) {
                console.error('Deletion failed');
            }
        }
    };

    const handleUpdate = async (id) => {
        try {
            await api.put(`/reviews/${id}`, editData);
            setEditing(null);
            fetchReviews();
        } catch (error) {
            console.error('Update failed');
        }
    };

    if (loading) return (
        <div className="">
            <div className=""></div>
            <p className="">Getting your reviews...</p>
        </div>
    );

    return (
        <div className="">
            <div className="">
                <div className="">
                    <div className="">
                       <History size={12} className=""/> My Reviews
                    </div>
                    <h2 className="">
                        Your <span className="">Reviews.</span>
                    </h2>
                    <p className="">
                        Manage your feedback and experiences with your favorite restaurants.
                    </p>
                </div>
            </div>

            <div className="">
                {reviews.map(rev => (
                    <div key={rev._id} className="">
                        
                        <div className="">
                             <MessageSquare size={180}/>
                        </div>
 
                        {editing === rev._id ? (
                            <div className="">
                                <div className="">
                                     <h4 className="">Edit <span className="">Review.</span></h4>
                                     <button onClick={() => setEditing(null)} className=""><X size={20}/></button>
                                </div>
                                <div className="">
                                    <div className="">
                                        <label className="">Rating</label>
                                        <div className="">
                                             {[1, 2, 3, 4, 5].map((num) => (
                                                 <button 
                                                      key={num} 
                                                      onClick={() => setEditData({...editData, rating: num})}
                                                      className=""
                                                 >
                                                     <Star size={24} fill={editData.rating >= num ? "currentColor" : "none"}/>
                                                 </button>
                                             ))}
                                         </div>
                                    </div>
                                    <div className="">
                                        <label className="">Comment</label>
                                        <textarea 
                                            className=""
                                            placeholder="Share your thoughts..."
                                            value={editData.comment}
                                            onChange={(e) => setEditData({...editData, comment: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleUpdate(rev._id)}
                                    className=""
                                >
                                    SAVE REVIEW <ArrowUpRight size={22} className=""/>
                                </button>
                            </div>
                        ) : (
                            <div className="">
                                <div className="">
                                     <button onClick={() => {
                                         setEditing(rev._id);
                                         setEditData({ rating: rev.rating, comment: rev.comment });
                                     }} className=""><Edit3 size={18}/></button>
                                     <button onClick={() => handleDelete(rev._id)} className=""><Trash size={18}/></button>
                                </div>
  
                                <div className="">
                                     <div className="">
                                         <MessageSquare size={24}/>
                                     </div>
                                     <div>
                                         <div className="">
                                            {rev.targetType.toUpperCase() === 'ATELIER' ? 'RESTAURANT' : 'FOOD ITEM'}
                                         </div>
                                         <div className="">
                                             {[...Array(5)].map((_, i) => (
                                                 <Star key={i} size={16} fill={i < rev.rating ? "currentColor" : "none"} />
                                             ))}
                                         </div>
                                     </div>
                                </div>
  
                                <p className="">"{rev.comment}"</p>
                                
                                <div className="">
                                     <div className="">
                                         <Clock size={12} className=""/> {new Date(rev.updatedAt).toLocaleDateString()}
                                     </div>
                                     {rev.status === 'Edited' && (
                                         <div className="">
                                            <Info size={10}/> UPDATED
                                         </div>
                                     )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {reviews.length === 0 && (
                    <div className="">
                        <div className="">
                             <AlertCircle className=""/>
                        </div>
                        <div className="">
                            <h3 className="">No reviews yet.</h3>
                            <p className="">You haven't shared any reviews yet.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyReviews;
