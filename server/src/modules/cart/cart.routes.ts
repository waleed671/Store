import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from './cart.controller';
import { optionalAuth } from '../../middleware/auth.middleware';

const router = Router();

router.use(optionalAuth);

router.get('/', getCart);

// Support both /add and /items (POST)
router.post('/add', addToCart);
router.post('/items', addToCart);

// Support both /update and /items/:productId (PUT)
router.put('/update', updateCartItem);
router.put('/items/:productId', updateCartItem);

// Support both /remove/:itemId and /items/:productId (DELETE)
router.delete('/remove/:itemId', removeFromCart);
router.delete('/items/:itemId', removeFromCart);

router.delete('/clear', clearCart);

export default router;
