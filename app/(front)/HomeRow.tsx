import Link from 'next/link';
import SmartImage from "@/components/SmartImage";
import HeartButton from '@/components/wishlist/HeartButton';
import { getDict, type Locale } from '@/app/i18n/dictionaries';
import { withLocale } from '@/app/i18n/locale';

import { getHomeProperties, PropertyCardData } from '../lib/api/properties';
import { getCars, CarCatalogItem } from '../lib/api/cars';
import { getYachts, YachtCatalogItem } from '../lib/api/yachts';

type GenericCatalogItem = PropertyCardData | CarCatalogItem | YachtCatalogItem;
type RowType = 'home' | 'car' | 'yacht';

interface RowProps {
  title: string;
  pretitle: string;
  data: GenericCatalogItem[];
  type: RowType;
  locale: Locale;
}

function RowHeader({ pretitle, title, type, locale }: { pretitle: string; title: string; type: RowType; locale: Locale }) {
  const routePrefix = type === 'home' ? 'properties' : type === 'car' ? 'cars' : 'yachts';
  const c = getDict(locale).common;
  const L = (href: string) => withLocale(href, locale);
  return (
    <div className="row-header">
      <div className="row-title-area">
        <span className="row-pretitle">{pretitle}</span>
        <h3>{title}</h3>
      </div>
      <Link href={L(`/${routePrefix}`)} className="row-see-more">
        {c.seeMore}
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
      </Link>
    </div>
  );
}

function HomeRow({ title, pretitle, data, type, locale }: RowProps) {
  const routePrefix = type === 'home' ? 'properties' : type === 'car' ? 'cars' : 'yachts';
  const c = getDict(locale).common;
  const L = (href: string) => withLocale(href, locale);

  return (
    <section className="home-row-section">
      <RowHeader pretitle={pretitle} title={title} type={type} locale={locale} />

      <div className="property-carousel">
        {data.length === 0 ? (
          <div className="w-full text-center py-8 text-gray-400 text-sm">
            {c.noItems}
          </div>
        ) : (
          data.map((item) => {
            const isProperty = type === 'home';
            const imgUrl = isProperty
              ? ((item as PropertyCardData).images?.[0] || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80")
              : (item as CarCatalogItem | YachtCatalogItem).img;
            const displaySpecs = isProperty
              ? `${(item as PropertyCardData).features?.bedrooms || 0} bd • ${(item as PropertyCardData).features?.bathrooms || 0} ba`
              : (item as CarCatalogItem | YachtCatalogItem).specs;
            const displayPrice = isProperty
              ? `${(item as PropertyCardData).price?.currency || '$'}${(item as PropertyCardData).price?.amount || 0} / ${(item as PropertyCardData).price?.period || 'night'}`
              : (item as CarCatalogItem | YachtCatalogItem).price;
            const displayRating = isProperty
              ? ((item as PropertyCardData).rating || "5.0")
              : (item as CarCatalogItem | YachtCatalogItem).rating;

            return (
              <a href={L(`/${routePrefix}/${item.id}`)} key={item.id} className="prop-card-link-wrapper" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="prop-card">
                  <div className={`prop-image-container ${type === 'car' ? 'car-ratio' : type === 'yacht' ? 'yacht-ratio' : ''}`}>
                    <SmartImage
                      src={imgUrl}
                      alt={item.title}
                      fallbackSrc={type === 'car'
                        ? "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80"
                        : "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=600&q=80"}
                    />
                    <HeartButton
                      className="heart-btn"
                      item={{
                        id: String(item.id),
                        type: type === 'home' ? 'property' : type,
                        title: item.title,
                        image: imgUrl,
                        price: displayPrice,
                        href: L(`/${routePrefix}/${item.id}`),
                        location: isProperty ? ((item as PropertyCardData).location || 'Miami, FL') : 'Miami, FL',
                      }}
                    />
                  </div>
                  <div className="prop-info">
                    <div className="prop-title-row">
                      <h4>{item.title}</h4>
                    </div>
                    <p className="prop-specs">{displaySpecs}</p>
                    <div className="prop-price-row">
                      <span className="price">{displayPrice}</span>
                      <span className="rating">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        {displayRating}
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            );
          })
        )}
      </div>
    </section>
  );
}

export function RowSkeleton({ pretitle, title, type, locale }: { pretitle: string; title: string; type: RowType; locale: Locale }) {
  return (
    <section className="home-row-section">
      <RowHeader pretitle={pretitle} title={title} type={type} locale={locale} />
      <div className="property-carousel">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="prop-card animate-pulse" style={{ opacity: 0.5 }}>
            <div className={`prop-image-container ${type === 'car' ? 'car-ratio' : type === 'yacht' ? 'yacht-ratio' : ''}`} style={{ backgroundColor: '#e4e4e7' }}></div>
            <div style={{ height: '16px', backgroundColor: '#e4e4e7', marginTop: '12px', borderRadius: '4px', width: '80%' }}></div>
            <div style={{ height: '12px', backgroundColor: '#e4e4e7', marginTop: '8px', borderRadius: '4px', width: '50%' }}></div>
          </div>
        ))}
      </div>
    </section>
  );
}

export async function HomesRow({ locale, pretitle, title }: { locale: Locale; pretitle: string; title: string }) {
  let data: PropertyCardData[] = [];
  try { data = (await getHomeProperties()).slice(0, 8); } catch (e) { console.error("Home properties:", e); }
  return <HomeRow pretitle={pretitle} title={title} data={data} type="home" locale={locale} />;
}

export async function CarsRow({ locale, pretitle, title }: { locale: Locale; pretitle: string; title: string }) {
  let data: CarCatalogItem[] = [];
  try { data = (await getCars()).slice(0, 4); } catch (e) { console.error("Home cars:", e); }
  return <HomeRow pretitle={pretitle} title={title} data={data} type="car" locale={locale} />;
}

export async function YachtsRow({ locale, pretitle, title }: { locale: Locale; pretitle: string; title: string }) {
  let data: YachtCatalogItem[] = [];
  try { data = (await getYachts()).slice(0, 4); } catch (e) { console.error("Home yachts:", e); }
  return <HomeRow pretitle={pretitle} title={title} data={data} type="yacht" locale={locale} />;
}
