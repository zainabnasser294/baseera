from django import template
from dashboard.utils import translate_digest_item

register = template.Library()

@register.filter(name='translate_digest')
def translate_digest(value, lang_code='ar'):
    if lang_code == 'en':
        if isinstance(value, list):
            return [translate_digest_item(item) for item in value]
        return translate_digest_item(value)
    return value
