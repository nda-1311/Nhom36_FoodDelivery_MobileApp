export type NavigateFunction = (page: string, data?: any) => void;

export interface BasePageProps {
  onNavigate: NavigateFunction;
}

export interface DataPageProps extends BasePageProps {
  data: any;
}

// Page-specific props extending base props
export interface AccountPageProps extends BasePageProps {}
export interface CallPageProps extends Partial<BasePageProps> {}
export interface CartPageProps extends BasePageProps {}
export interface ChatPageProps extends BasePageProps {}
export interface CheckoutPageProps extends BasePageProps {}
export interface FavoritesPageProps extends BasePageProps {
  favorites: any[];
  onToggleFavorite: (id: string) => void;
}
export interface FoodDetailsPageProps extends DataPageProps {}
export interface HistoryPageProps extends BasePageProps {}
export interface HomePageProps extends BasePageProps {
  favorites: any[];
  onToggleFavorite: (id: string) => void;
}
export interface InboxPageProps extends BasePageProps {}
export interface InitdbPageProps extends BasePageProps {}
export interface JoinPartyPageProps extends BasePageProps {}
export interface LocationSelectionPageProps extends BasePageProps {}
export interface LogoutPageProps extends BasePageProps {}
export interface MapTrackingPageProps extends BasePageProps {}
export interface OrderTrackingPageProps extends BasePageProps {}
export interface RatingPageProps extends BasePageProps {}
export interface RestaurantPageProps extends DataPageProps {}
export interface SearchPageProps extends BasePageProps {
  initialQuery?: string;
}
export interface VoucherPageProps extends BasePageProps {}
