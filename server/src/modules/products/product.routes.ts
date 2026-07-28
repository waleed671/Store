import { Router } from 'express';
import {
  getProducts, getProduct, createProduct, updateProduct,
  deleteProduct, getRelatedProducts, getFeaturedProducts,
} from './product.controller';
import { protect, authorize } from '../../middleware/auth.middleware';

const router = Router();

router.get('/',           getProducts);
router.get('/featured',   getFeaturedProducts);
router.get('/:slug',      getProduct);
router.get('/:id/related',getRelatedProducts);
router.post('/',          protect, authorize('admin','manager'), createProduct);
router.put('/:id',        protect, authorize('admin','manager'), updateProduct);
router.delete('/:id',     protect, authorize('admin'), deleteProduct);

export default router;
