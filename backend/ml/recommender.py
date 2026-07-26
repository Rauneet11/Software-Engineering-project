"""
AI Business Recommendation Engine
Generates rule-based business recommendations from prediction results.
"""
import numpy as np
from datetime import datetime


class RecommendationEngine:
    """Generate actionable business recommendations from prediction data."""

    def generate(self, results: dict) -> list:
        """Generate a list of recommendation dicts from prediction results."""
        recommendations = []

        product_summary   = results.get('product_summary', [])
        category_analysis = results.get('category_analysis', [])
        forecast          = results.get('forecast', {})
        future_forecast   = forecast.get('future', [])

        # 1. Top product – increase inventory
        if product_summary:
            top = product_summary[0]
            recommendations.append({
                'type':        'inventory',
                'priority':    'high',
                'icon':        '\U0001f4e6',
                'title':       f'Increase Inventory for {top["product"]}',
                'description': f'Best-performing product with revenue Rs.{top["revenue"]:,.0f}. Consider increasing stock by 20-30% to meet demand.',
                'action':      'INCREASE_STOCK',
                'product':     top['product'],
            })

            if len(product_summary) > 1:
                bottom = product_summary[-1]
                recommendations.append({
                    'type':        'marketing',
                    'priority':    'medium',
                    'icon':        '\U0001f4c9',
                    'title':       f'Review Strategy for {bottom["product"]}',
                    'description': f'Lowest revenue product at Rs.{bottom["revenue"]:,.0f}. Consider reducing marketing spend or revamping product positioning.',
                    'action':      'REVIEW_STRATEGY',
                    'product':     bottom['product'],
                })

        # 2. Category focus
        if category_analysis:
            top_cat = category_analysis[0]
            recommendations.append({
                'type':        'category',
                'priority':    'high',
                'icon':        '\U0001f3af',
                'title':       f'Focus Resources on {top_cat["category"]} Category',
                'description': f'The {top_cat["category"]} category drives Rs.{top_cat["revenue"]:,.0f} in revenue. Allocate more budget here for maximum ROI.',
                'action':      'INCREASE_BUDGET',
                'category':    top_cat['category'],
            })

        # 3. Growth trend analysis
        if len(future_forecast) >= 2:
            first = future_forecast[0].get('predicted_revenue', 0)
            last  = future_forecast[-1].get('predicted_revenue', 0)
            if first > 0:
                growth = (last - first) / first * 100
                if growth > 10:
                    recommendations.append({
                        'type':        'opportunity',
                        'priority':    'high',
                        'icon':        '\U0001f680',
                        'title':       'Strong Growth Predicted – Prepare Now',
                        'description': f'Revenue is projected to grow by {growth:.1f}% over the forecast period. Prepare inventory, staffing, and logistics accordingly.',
                        'action':      'PREPARE_GROWTH',
                    })
                elif growth < -5:
                    recommendations.append({
                        'type':        'warning',
                        'priority':    'high',
                        'icon':        '\u26a0\ufe0f',
                        'title':       'Revenue Decline Predicted – Take Action',
                        'description': f'Revenue is projected to decline by {abs(growth):.1f}%. Consider discounts, promotions, or new product launches to reverse the trend.',
                        'action':      'MITIGATE_DECLINE',
                    })

        # 4. Seasonal advice
        current_month = datetime.now().month
        if current_month in [10, 11, 12]:
            recommendations.append({
                'type':        'seasonal',
                'priority':    'high',
                'icon':        '\U0001f384',
                'title':       'Festive Season Approaching – Stock Up',
                'description': 'Q4 typically sees 30-50% higher sales. Ensure adequate inventory and plan marketing campaigns for Diwali, Christmas, and New Year.',
                'action':      'FESTIVE_PREP',
            })
        elif current_month in [1, 2]:
            recommendations.append({
                'type':        'seasonal',
                'priority':    'medium',
                'icon':        '\u2744\ufe0f',
                'title':       'Post-Festive Slowdown – Offer Discounts',
                'description': 'January-February typically see lower sales. Consider clearance sales and loyalty programs to maintain revenue momentum.',
                'action':      'POST_FESTIVE_STRATEGY',
            })
        elif current_month in [6, 7, 8]:
            recommendations.append({
                'type':        'seasonal',
                'priority':    'medium',
                'icon':        '\U0001f31e',
                'title':       'Mid-Year Review – Optimize Strategy',
                'description': 'Mid-year is the perfect time to review H1 performance and adjust marketing spend for the second half of the year.',
                'action':      'MID_YEAR_REVIEW',
            })

        # 5. Digital expansion
        recommendations.append({
            'type':        'digital',
            'priority':    'medium',
            'icon':        '\U0001f4bb',
            'title':       'Expand Digital Marketing Channels',
            'description': 'Data shows untapped potential in digital channels. Investing in social media ads and SEO can yield 15-25% revenue boost within 3 months.',
            'action':      'DIGITAL_EXPANSION',
        })

        # 6. Loyalty program
        recommendations.append({
            'type':        'loyalty',
            'priority':    'low',
            'icon':        '\U0001f3c6',
            'title':       'Launch Customer Loyalty Program',
            'description': 'Retaining existing customers costs 5x less than acquiring new ones. Implement a points-based loyalty system to improve repeat purchases.',
            'action':      'LOYALTY_PROGRAM',
        })

        # 7. Pricing optimization
        recommendations.append({
            'type':        'pricing',
            'priority':    'medium',
            'icon':        '\U0001f4b0',
            'title':       'Implement Dynamic Pricing Strategy',
            'description': 'Use demand-based pricing to maximize revenue during peak seasons and maintain volume during slow periods. AI-driven pricing can increase margins by 8-12%.',
            'action':      'DYNAMIC_PRICING',
        })

        return recommendations
